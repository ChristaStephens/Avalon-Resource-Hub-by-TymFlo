import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SupportOptionPicker } from "@/components/SupportOptionPicker";
import {
  createResource,
  updateResource,
  removeResource,
  restoreResource,
  fetchAllResources,
  fetchPendingApplications,
  approveResource,
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
  const [activeTab, setActiveTab] = useState<"add" | "edit" | "remove" | "approve">("add");

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

  // Approve tab state
  const [pendingApps, setPendingApps] = useState<Resource[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [approveMessage, setApproveMessage] = useState<string | null>(null);
  const [lastApproved, setLastApproved] = useState<Resource | null>(null);
  const [copiedField, setCopiedField] = useState<"link" | "email" | null>(null);

  // Edit tab state
  const [editSelected, setEditSelected] = useState<Resource | null>(null);
  const [editSearch, setEditSearch] = useState("");
  const [editForm, setEditForm] = useState({
    organization: "",
    contact: "",
    website: "",
    primaryEmail: "",
    secondaryEmail: "",
    costs: "",
    uninsured: "",
    supportOptions: [] as string[],
    notes: "",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

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

  const loadPendingApps = async () => {
    setPendingLoading(true);
    setPendingError(null);
    try {
      const data = await fetchPendingApplications();
      setPendingApps(data);
    } catch (err) {
      setPendingError(err instanceof Error ? err.message : "Failed to load pending applications");
    } finally {
      setPendingLoading(false);
    }
  };

  const handleApprove = async (resource: Resource) => {
    setActionInProgress(resource.id);
    setApproveMessage(null);
    setLastApproved(null);
    try {
      await approveResource(resource);
      setLastApproved(resource);
      await loadPendingApps();
    } catch (err) {
      setApproveMessage(`Error: ${err instanceof Error ? err.message : "Failed to approve"}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const getEditUrl = (resource: Resource) => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    return `${window.location.origin}${base}/request-edit?id=${encodeURIComponent(resource.id)}`;
  };

  const getEmailTemplate = (resource: Resource) => {
    const editUrl = getEditUrl(resource);
    return [
      `Subject: Your listing on the Avalon Resource Hub has been approved`,
      ``,
      `Hi ${resource.contact || "there"},`,
      ``,
      `Great news — ${resource.organization} is now live on the Avalon Resource Hub! Survivors in the Detroit area can find your organization at:`,
      `https://avalonhealingcenter.org/resource-hub`,
      ``,
      `If your information ever changes — contact details, services offered, costs, or anything else — you can request an update using the private link below:`,
      ``,
      `${editUrl}`,
      ``,
      `Just click the link, update any fields that need changing, and submit. Your request will go to Avalon staff for review. We'll approve and apply the changes within a few business days — nothing goes live without our team checking it first.`,
      ``,
      `Please keep this link private, as it's specific to your listing.`,
      ``,
      `Thank you for being part of our network of resources for survivors.`,
      ``,
      `Warmly,`,
      `The Avalon Healing Center Team`,
    ].join("\n");
  };

  const handleCopy = (text: string, field: "link" | "email") => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleEditSelect = (resource: Resource) => {
    setEditSelected(resource);
    setEditSuccess(null);
    setEditError(null);
    setEditForm({
      organization: resource.organization,
      contact: resource.contact,
      website: resource.website,
      primaryEmail: resource.primaryContactEmail,
      secondaryEmail: resource.secondaryContactEmail,
      costs: resource.costs,
      uninsured: resource.uninsured,
      supportOptions: [...resource.supportOptions],
      notes: resource.notes,
    });
  };

  const handleEditSupportToggle = (opt: string) => {
    setEditForm((f) => ({
      ...f,
      supportOptions: f.supportOptions.includes(opt)
        ? f.supportOptions.filter((s) => s !== opt)
        : [...f.supportOptions, opt],
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSelected) return;
    setEditError(null);

    if (!editForm.organization.trim()) { setEditError("Organization Name is required."); return; }
    if (editForm.supportOptions.length === 0) { setEditError("Please select at least one Support Option."); return; }

    setEditSubmitting(true);
    try {
      const fields: Record<string, unknown> = {
        Organization: editForm.organization,
        "Support Options": editForm.supportOptions,
        Contact: editForm.contact || "",
        Website: editForm.website || "",
        "Primary Contact Email": editForm.primaryEmail || "",
        "Secondary Contact Email": editForm.secondaryEmail || "",
        "Costs ": editForm.costs || "",
        Uninsured: editForm.uninsured || "",
        NOTES: editForm.notes || "",
      };
      await updateResource(editSelected.id, fields);
      setEditSuccess(`"${editForm.organization}" has been updated successfully.`);
      setEditSelected(null);
      setEditSearch("");
      await loadResources(true);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setEditSubmitting(false);
    }
  };

  useEffect(() => {
    if (authenticated && (activeTab === "remove" || activeTab === "edit")) {
      loadResources();
    }
    if (authenticated && activeTab === "approve") {
      loadPendingApps();
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
                className={`staff-tab ${activeTab === "edit" ? "active" : ""}`}
                onClick={() => { setActiveTab("edit"); setEditSelected(null); setEditSuccess(null); setEditError(null); }}
              >
                ✎ Edit Organization
              </button>
              <button
                className={`staff-tab ${activeTab === "remove" ? "active" : ""}`}
                onClick={() => setActiveTab("remove")}
              >
                Remove Organization
              </button>
              <button
                className={`staff-tab staff-tab--approve ${activeTab === "approve" ? "active" : ""}`}
                onClick={() => setActiveTab("approve")}
              >
                ✓ Approve Organization
                {pendingApps.length > 0 && (
                  <span className="approve-tab-badge">{pendingApps.length}</span>
                )}
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
                    <SupportOptionPicker
                      selected={form.supportOptions}
                      onChange={handleSupportToggle}
                    />
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

          {activeTab === "edit" && (
            <div className="edit-tab">
              {editSuccess && (
                <div className="success-banner">
                  ✓ {editSuccess}
                  <button onClick={() => setEditSuccess(null)} className="dismiss-btn">Dismiss</button>
                </div>
              )}

              {!editSelected ? (
                <>
                  <div className="remove-section">
                    <h3 className="remove-section-title">
                      Active Organizations
                      <span className="remove-count">{activeResources.length}</span>
                    </h3>
                    <p className="remove-section-desc">
                      Select an organization to edit its listing directly. Changes save immediately to Airtable and update the public hub within the hour.
                    </p>

                    {resourcesLoading && (
                      <div className="loading-state" style={{ padding: "32px 0" }}>
                        <div className="spinner" />
                        <p>Loading organizations…</p>
                      </div>
                    )}

                    {!resourcesLoading && (
                      <>
                        {activeResources.length > 6 && (
                          <div style={{ marginBottom: 12 }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Search organizations…"
                              value={editSearch}
                              onChange={(e) => setEditSearch(e.target.value)}
                              style={{ maxWidth: 360 }}
                            />
                          </div>
                        )}
                        <div className="remove-list">
                          {activeResources
                            .filter((r) => !editSearch || r.organization.toLowerCase().includes(editSearch.toLowerCase()))
                            .map((r) => (
                              <div key={r.id} className="remove-row">
                                <div className="remove-row-info">
                                  <span className="remove-org-name">{r.organization}</span>
                                  {r.contact && <span className="remove-org-contact">{r.contact}</span>}
                                </div>
                                <div className="remove-row-actions">
                                  <button className="edit-select-btn" onClick={() => handleEditSelect(r)}>
                                    ✎ Edit
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                        {activeResources.length === 0 && (
                          <p className="empty-state-small">No active organizations found.</p>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <button
                      className="provider-back-link"
                      onClick={() => { setEditSelected(null); setEditError(null); }}
                    >
                      ← Back to organization list
                    </button>
                  </div>

                  {editError && (
                    <div className="error-banner" style={{ marginBottom: 20 }}>
                      ⚠️ {editError}
                      <button onClick={() => setEditError(null)} className="dismiss-btn">Dismiss</button>
                    </div>
                  )}

                  <div className="form-public-notice" style={{ marginBottom: 20 }}>
                    ✎ Editing <strong>{editSelected.organization}</strong> — changes save directly to Airtable and will be live on the hub within the hour.
                  </div>

                  <form onSubmit={handleEditSubmit} className="staff-form">
                    <div className="form-section">
                      <h3>Organization Info</h3>
                      <div className="form-grid">
                        <div className="form-field">
                          <label htmlFor="e-org">Organization Name <span className="required-star">*</span></label>
                          <input
                            id="e-org"
                            type="text"
                            required
                            value={editForm.organization}
                            onChange={(e) => setEditForm((f) => ({ ...f, organization: e.target.value }))}
                            className="form-input"
                          />
                        </div>
                        <div className="form-field">
                          <label htmlFor="e-contact">Contact Name</label>
                          <input
                            id="e-contact"
                            type="text"
                            value={editForm.contact}
                            onChange={(e) => setEditForm((f) => ({ ...f, contact: e.target.value }))}
                            className="form-input"
                          />
                        </div>
                        <div className="form-field">
                          <label htmlFor="e-website">Website URL</label>
                          <input
                            id="e-website"
                            type="text"
                            value={editForm.website}
                            onChange={(e) => setEditForm((f) => ({ ...f, website: e.target.value }))}
                            className="form-input"
                          />
                        </div>
                        <div className="form-field">
                          <label htmlFor="e-email">Primary Contact Email</label>
                          <input
                            id="e-email"
                            type="email"
                            value={editForm.primaryEmail}
                            onChange={(e) => setEditForm((f) => ({ ...f, primaryEmail: e.target.value }))}
                            className="form-input"
                          />
                        </div>
                        <div className="form-field">
                          <label htmlFor="e-email2">Secondary Contact Email</label>
                          <input
                            id="e-email2"
                            type="email"
                            value={editForm.secondaryEmail}
                            onChange={(e) => setEditForm((f) => ({ ...f, secondaryEmail: e.target.value }))}
                            className="form-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Services &amp; Cost</h3>
                      <div className="form-grid">
                        <div className="form-field">
                          <label htmlFor="e-costs">Cost Structure</label>
                          <select
                            id="e-costs"
                            value={editForm.costs}
                            onChange={(e) => setEditForm((f) => ({ ...f, costs: e.target.value }))}
                            className="form-input"
                          >
                            <option value="">Select cost type…</option>
                            {COST_OPTIONS.map((o) => <option key={o} value={o}>{o.trim()}</option>)}
                          </select>
                        </div>
                        <div className="form-field">
                          <label htmlFor="e-uninsured">Accepts Uninsured Patients?</label>
                          <select
                            id="e-uninsured"
                            value={editForm.uninsured}
                            onChange={(e) => setEditForm((f) => ({ ...f, uninsured: e.target.value }))}
                            className="form-input"
                          >
                            <option value="">Unknown</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="No - Sliding Scale">No - Sliding Scale</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-field full-width" style={{ marginTop: 16 }}>
                        <label>Support Options <span className="required-star">*</span> <span className="label-hint">select all that apply</span></label>
                        <SupportOptionPicker
                          selected={editForm.supportOptions}
                          onChange={handleEditSupportToggle}
                        />
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Notes</h3>
                      <div className="form-field full-width">
                        <label htmlFor="e-notes">Notes</label>
                        <textarea
                          id="e-notes"
                          value={editForm.notes}
                          onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                          className="form-textarea"
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="confirm-no-btn"
                        style={{ padding: "12px 24px", marginRight: 12 }}
                        onClick={() => { setEditSelected(null); setEditError(null); }}
                      >
                        Cancel
                      </button>
                      <button type="submit" disabled={editSubmitting} className="submit-btn">
                        {editSubmitting ? "Saving…" : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {activeTab === "approve" && (
            <div className="approve-tab">
              {lastApproved && (
                <div className="approval-email-panel">
                  <div className="approval-email-header">
                    <span className="approval-email-check">✓</span>
                    <div>
                      <strong>"{lastApproved.organization}" is now live.</strong>
                      <span className="approval-email-sub"> Send the provider their edit link using the email template below.</span>
                    </div>
                    <button className="dismiss-btn" onClick={() => setLastApproved(null)}>Dismiss</button>
                  </div>

                  <div className="approval-email-row">
                    <label className="approval-email-label">Edit link (private — for this org only)</label>
                    <div className="approval-email-copy-row">
                      <code className="approval-email-code">{getEditUrl(lastApproved)}</code>
                      <button
                        className="approval-copy-btn"
                        onClick={() => handleCopy(getEditUrl(lastApproved), "link")}
                      >
                        {copiedField === "link" ? "✓ Copied" : "Copy link"}
                      </button>
                    </div>
                  </div>

                  <div className="approval-email-row">
                    <label className="approval-email-label">Ready-to-send email — paste into your email client</label>
                    <textarea
                      className="approval-email-textarea"
                      readOnly
                      rows={18}
                      value={getEmailTemplate(lastApproved)}
                    />
                    <button
                      className="approval-copy-btn"
                      onClick={() => handleCopy(getEmailTemplate(lastApproved), "email")}
                    >
                      {copiedField === "email" ? "✓ Copied" : "Copy email"}
                    </button>
                  </div>
                </div>
              )}

              {approveMessage && (
                <div className={`error-banner`}>
                  {approveMessage}
                  <button onClick={() => setApproveMessage(null)} className="dismiss-btn">Dismiss</button>
                </div>
              )}

              {pendingError && (
                <div className="error-banner">
                  ⚠️ {pendingError}
                  <button onClick={() => loadPendingApps()} className="dismiss-btn">Retry</button>
                </div>
              )}

              {pendingLoading && (
                <div className="loading-state">
                  <div className="spinner" />
                  <p>Loading pending applications...</p>
                </div>
              )}

              {!pendingLoading && !pendingError && (
                <>
                  <div className="approve-section-header">
                    <h3 className="remove-section-title">
                      Pending Applications
                      <span className="remove-count">{pendingApps.length}</span>
                    </h3>
                    <p className="remove-section-desc">
                      These organizations submitted an application to be listed on the Resource Hub. Review each one and click Approve to make them live.
                    </p>
                  </div>

                  {pendingApps.length === 0 ? (
                    <div className="approve-empty">
                      <div className="approve-empty-icon">✓</div>
                      <p>No pending applications — you're all caught up!</p>
                    </div>
                  ) : (
                    <div className="approve-list">
                      {pendingApps.map((r) => (
                        <div key={r.id} className="approve-row">
                          <div className="approve-row-info">
                            <span className="approve-org-name">{r.organization}</span>
                            <div className="approve-org-meta">
                              {r.website && (
                                <a href={r.website} target="_blank" rel="noopener noreferrer" className="approve-meta-link">
                                  🌐 {r.website}
                                </a>
                              )}
                              {r.primaryContactEmail && (
                                <span className="approve-meta-item">✉ {r.primaryContactEmail}</span>
                              )}
                              {r.contact && (
                                <span className="approve-meta-item">👤 {r.contact}</span>
                              )}
                            </div>
                            {r.notes && (
                              <p className="approve-org-notes">{r.notes}</p>
                            )}
                          </div>
                          <div className="approve-row-actions">
                            <button
                              className="approve-btn"
                              disabled={actionInProgress === r.id}
                              onClick={() => handleApprove(r)}
                            >
                              {actionInProgress === r.id ? "Approving..." : "✓ Approve"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
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
