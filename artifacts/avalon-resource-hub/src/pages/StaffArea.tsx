import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  createResource,
  removeResource,
  restoreResource,
  fetchAllResources,
  clearCache,
  AIRTABLE_CONFIGURED,
  Resource,
} from "@/lib/airtable";

const STAFF_PASSWORD_HASH = import.meta.env.VITE_STAFF_PASSWORD_HASH || "";

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const SUPPORT_OPTIONS = [
  "STI Testing",
  "HIV Testing",
  "Pregnancy Tests",
  "Pregnancy Confirmations",
  "Contraception",
  "Ultrasounds",
  "Live Birth",
  "Grief/Loss",
  "Undocumented",
  "Termination",
  "Chronic Care",
  "Dental",
  "Behavioral",
  "Uninsured",
  "Transporation",
];

const COST_OPTIONS = [
  "Free - No costs ",
  "Free prenatal care; insurance billed for well person gyn ",
  "Insurance based",
  "Will help with insurance sign up",
  "Offers - Free prenatals ",
  "Based on EGA - Financial Assistance Available",
];

const EMPTY_FORM = {
  organization: "",
  contact: "",
  website: "",
  primaryEmail: "",
  secondaryEmail: "",
  costs: "",
  uninsured: "",
  supportOptions: [] as string[],
  notes: "",
  approvedByAvalon: false,
};

export default function StaffArea() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [activeTab, setActiveTab] = useState<"add" | "remove">("add");

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourcesError, setResourcesError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const hashed = await sha256(password);
    if (hashed === STAFF_PASSWORD_HASH) {
      setAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  const loadResources = async (force = false) => {
    setResourcesLoading(true);
    setResourcesError(null);
    try {
      const data = await fetchAllResources(force);
      setResources(data);
    } catch (err) {
      setResourcesError(err instanceof Error ? err.message : "Failed to load resources");
    } finally {
      setResourcesLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && activeTab === "remove") {
      loadResources();
    }
  }, [authenticated, activeTab]);

  const handleSupportToggle = (opt: string) => {
    setForm((f) => ({
      ...f,
      supportOptions: f.supportOptions.includes(opt)
        ? f.supportOptions.filter((s) => s !== opt)
        : [...f.supportOptions, opt],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Client-side required field validation
    if (!form.organization.trim()) {
      setSubmitError("Organization Name is required.");
      return;
    }
    if (!form.website.trim()) {
      setSubmitError("Website URL is required.");
      return;
    }
    if (!form.primaryEmail.trim()) {
      setSubmitError("Primary Contact Email is required.");
      return;
    }
    if (!form.costs) {
      setSubmitError("Cost Structure is required.");
      return;
    }
    if (form.supportOptions.length === 0) {
      setSubmitError("Please select at least one Support Option.");
      return;
    }
    if (!form.approvedByAvalon) {
      setSubmitError("Please confirm the organization is Approved by Avalon before adding it.");
      return;
    }

    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        Organization: form.organization,
        "Support Options": form.supportOptions,
        "Costs ": form.costs,
        "Approved by Avalon Admin": true,
      };
      if (form.contact) payload["Contact"] = form.contact;
      if (form.website) payload["Website"] = form.website;
      if (form.primaryEmail) payload["Primary Contact Email"] = form.primaryEmail;
      if (form.secondaryEmail) payload["Secondary Contact Email"] = form.secondaryEmail;
      if (form.uninsured) payload["Uninsured"] = form.uninsured;
      if (form.notes) payload["NOTES"] = form.notes;

      await createResource(payload);
      setSubmitSuccess(true);
      clearCache();
      setForm(EMPTY_FORM);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit resource");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (resource: Resource) => {
    setActionInProgress(resource.id);
    setActionMessage(null);
    try {
      await removeResource(resource);
      setActionMessage(`"${resource.organization}" has been hidden from public view and marked as removed in the database.`);
      await loadResources(true);
    } catch (err) {
      setActionMessage(`Error: ${err instanceof Error ? err.message : "Failed to remove"}`);
    } finally {
      setActionInProgress(null);
      setConfirmRemove(null);
    }
  };

  const handleRestore = async (resource: Resource) => {
    setActionInProgress(resource.id);
    setActionMessage(null);
    try {
      await restoreResource(resource);
      setActionMessage(`"${resource.organization}" has been restored and is now visible to the public.`);
      await loadResources(true);
    } catch (err) {
      setActionMessage(`Error: ${err instanceof Error ? err.message : "Failed to restore"}`);
    } finally {
      setActionInProgress(null);
    }
  };

  if (!authenticated) {
    return (
      <div className="page-wrapper">
        <Header showStaffLink={false} />
        <main className="main-content">
          <div className="staff-login-card">
            <div className="staff-login-icon">🔒</div>
            <h2>Staff Access</h2>
            <p>This area is for Avalon staff only. Please enter the staff password to continue.</p>
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter staff password"
                className="login-input"
                autoComplete="current-password"
              />
              {passwordError && <p className="login-error">{passwordError}</p>}
              <button type="submit" className="login-btn">Access Staff Area</button>
            </form>
            <a href="/" className="back-link">← Back to Resource Hub</a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!AIRTABLE_CONFIGURED) {
    return (
      <div className="page-wrapper">
        <Header showStaffLink={false} />
        <main className="main-content">
          <div className="setup-notice">
            <h2>Airtable Not Configured</h2>
            <p>Please set VITE_AIRTABLE_BASE_ID and VITE_AIRTABLE_PAT environment variables.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const activeResources = resources.filter((r) => !r.removed);
  const removedResources = resources.filter((r) => r.removed);

  return (
    <div className="page-wrapper">
      <Header showStaffLink={false} />
      <main className="main-content">
        <div className="staff-area">

          <div className="staff-header">
            <div className="staff-header-top">
              <div>
                <h2>Staff Area</h2>
                <p>Manage the organizations shown in the public Resource Hub.</p>
              </div>
              <a href="/" className="back-link">← View Public Hub</a>
            </div>

            <div className="staff-resource-links">
              <a
                href={`${import.meta.env.BASE_URL}walkthrough/`}
                target="_blank"
                rel="noopener noreferrer"
                className="staff-resource-card staff-resource-card--video"
              >
                <span className="staff-resource-icon">▶</span>
                <span className="staff-resource-label">Watch Video Walkthrough</span>
                <span className="staff-resource-arrow">→</span>
              </a>
              <a
                href={`${import.meta.env.BASE_URL || "/"}staff-guide.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="staff-resource-card staff-resource-card--guide"
              >
                <span className="staff-resource-icon">📋</span>
                <span className="staff-resource-label">Open Written Staff Guide</span>
                <span className="staff-resource-arrow">→</span>
              </a>
            </div>

            <div className="staff-tabs">
              <button
                className={`staff-tab ${activeTab === "add" ? "active" : ""}`}
                onClick={() => setActiveTab("add")}
              >
                + Add Organization
              </button>
              <button
                className={`staff-tab ${activeTab === "remove" ? "active" : ""}`}
                onClick={() => setActiveTab("remove")}
              >
                Remove Organization
              </button>
            </div>
          </div>

          {activeTab === "add" && (
            <>
              {submitSuccess && (
                <div className="success-banner">
                  ✓ Resource added successfully! The public hub will update within the hour.
                  <button onClick={() => setSubmitSuccess(false)} className="dismiss-btn">Dismiss</button>
                </div>
              )}
              {submitError && (
                <div className="error-banner">
                  ⚠️ {submitError}
                  <button onClick={() => setSubmitError(null)} className="dismiss-btn">Dismiss</button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="staff-form">
                <div className="form-public-notice">
                  💡 <strong>Just a heads up</strong> — the organization details you enter in this form will be visible to the public on the Resource Hub once you hit submit.
                </div>
                <div className="form-section">
                  <h3>Organization Info</h3>
                  <div className="form-grid">
                    <div className="form-field">
                      <label htmlFor="org">Organization Name <span className="required-star">*</span></label>
                      <input
                        id="org"
                        type="text"
                        required
                        value={form.organization}
                        onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                        placeholder="e.g. Birth Detroit"
                        className="form-input"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="contact">Contact Name</label>
                      <input
                        id="contact"
                        type="text"
                        value={form.contact}
                        onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                        placeholder="e.g. Jane Smith"
                        className="form-input"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="website">Website URL <span className="required-star">*</span></label>
                      <input
                        id="website"
                        type="url"
                        value={form.website}
                        onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                        placeholder="https://example.org"
                        className="form-input"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="primaryEmail">Primary Contact Email <span className="required-star">*</span></label>
                      <input
                        id="primaryEmail"
                        type="email"
                        value={form.primaryEmail}
                        onChange={(e) => setForm((f) => ({ ...f, primaryEmail: e.target.value }))}
                        placeholder="contact@example.org"
                        className="form-input"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="secondaryEmail">Secondary Contact Email</label>
                      <input
                        id="secondaryEmail"
                        type="email"
                        value={form.secondaryEmail}
                        onChange={(e) => setForm((f) => ({ ...f, secondaryEmail: e.target.value }))}
                        placeholder="secondary@example.org"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Services & Cost</h3>
                  <div className="form-grid">
                    <div className="form-field">
                      <label htmlFor="costs">Cost Structure <span className="required-star">*</span></label>
                      <select
                        id="costs"
                        value={form.costs}
                        onChange={(e) => setForm((f) => ({ ...f, costs: e.target.value }))}
                        className="form-input"
                      >
                        <option value="">Select cost type...</option>
                        {COST_OPTIONS.map((o) => <option key={o} value={o}>{o.trim()}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="uninsured">Accepts Uninsured Patients?</label>
                      <select
                        id="uninsured"
                        value={form.uninsured}
                        onChange={(e) => setForm((f) => ({ ...f, uninsured: e.target.value }))}
                        className="form-input"
                      >
                        <option value="">Unknown</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="No - Sliding Scale">No - Sliding Scale</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-field full-width">
                    <label>Support Options <span className="required-star">*</span> <span className="label-hint">select all that apply</span></label>
                    <div className="support-checkboxes">
                      {SUPPORT_OPTIONS.map((opt) => (
                        <label key={opt} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={form.supportOptions.includes(opt)}
                            onChange={() => handleSupportToggle(opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Additional Notes</h3>
                  <div className="form-field full-width">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                      id="notes"
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Any additional information about this organization..."
                      className="form-textarea"
                      rows={4}
                    />
                  </div>
                  <div className="form-field">
                    <label className="checkbox-label approved-check">
                      <input
                        type="checkbox"
                        checked={form.approvedByAvalon}
                        onChange={(e) => setForm((f) => ({ ...f, approvedByAvalon: e.target.checked }))}
                      />
                      <span>Approved by Avalon <span className="required-star">*</span></span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={submitting} className="submit-btn">
                    {submitting ? "Adding Resource..." : "Add Resource to Hub"}
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === "remove" && (
            <div className="remove-tab">
              {actionMessage && (
                <div className={`success-banner`}>
                  {actionMessage}
                  <button onClick={() => setActionMessage(null)} className="dismiss-btn">Dismiss</button>
                </div>
              )}

              {resourcesError && (
                <div className="error-banner">
                  ⚠️ {resourcesError}
                  <button onClick={() => loadResources(true)} className="dismiss-btn">Retry</button>
                </div>
              )}

              {resourcesLoading && (
                <div className="loading-state">
                  <div className="spinner" />
                  <p>Loading organizations...</p>
                </div>
              )}

              {!resourcesLoading && (
                <>
                  <div className="remove-section">
                    <h3 className="remove-section-title">
                      Active Organizations
                      <span className="remove-count">{activeResources.length}</span>
                    </h3>
                    <p className="remove-section-desc">These organizations are currently visible to the public. Click Remove to hide one.</p>

                    {activeResources.length === 0 && (
                      <p className="empty-state-small">No active organizations found.</p>
                    )}

                    <div className="remove-list">
                      {activeResources.map((r) => (
                        <div key={r.id} className="remove-row">
                          <div className="remove-row-info">
                            <span className="remove-org-name">{r.organization}</span>
                            {r.contact && <span className="remove-org-contact">{r.contact}</span>}
                          </div>
                          <div className="remove-row-actions">
                            {confirmRemove === r.id ? (
                              <>
                                <span className="confirm-text">Are you sure?</span>
                                <button
                                  className="confirm-yes-btn"
                                  disabled={actionInProgress === r.id}
                                  onClick={() => handleRemove(r)}
                                >
                                  {actionInProgress === r.id ? "Removing..." : "Yes, Remove"}
                                </button>
                                <button
                                  className="confirm-no-btn"
                                  onClick={() => setConfirmRemove(null)}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                className="remove-btn"
                                onClick={() => setConfirmRemove(r.id)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {removedResources.length > 0 && (
                    <div className="remove-section removed-section">
                      <h3 className="remove-section-title">
                        Removed Organizations
                        <span className="remove-count removed">{removedResources.length}</span>
                      </h3>
                      <p className="remove-section-desc">These are hidden from the public but remain in the database. Click Restore to make them visible again.</p>

                      <div className="remove-list">
                        {removedResources.map((r) => (
                          <div key={r.id} className="remove-row removed-row">
                            <div className="remove-row-info">
                              <span className="remove-org-name removed-name">{r.organization}</span>
                              {r.contact && <span className="remove-org-contact">{r.contact}</span>}
                              <span className="removed-badge">Hidden</span>
                            </div>
                            <div className="remove-row-actions">
                              <button
                                className="restore-btn"
                                disabled={actionInProgress === r.id}
                                onClick={() => handleRestore(r)}
                              >
                                {actionInProgress === r.id ? "Restoring..." : "Restore"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
