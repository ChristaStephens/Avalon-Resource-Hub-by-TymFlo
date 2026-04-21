import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createResource, clearCache, AIRTABLE_CONFIGURED } from "@/lib/airtable";

const STAFF_PASSWORD = import.meta.env.VITE_STAFF_PASSWORD || "avalon2024";

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

export default function StaffArea() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [form, setForm] = useState({
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
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === STAFF_PASSWORD) {
      setAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

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
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload: Record<string, unknown> = {
        Organization: form.organization,
        "Support Options": form.supportOptions.length ? form.supportOptions : undefined,
        "Costs ": form.costs || undefined,
        Uninsured: form.uninsured || undefined,
        NOTES: form.notes || undefined,
        "Approved by Avalon Admin": form.approvedByAvalon || undefined,
      };
      if (form.contact) payload["Contact"] = form.contact;
      if (form.website) payload["Website"] = form.website;
      if (form.primaryEmail) payload["Primary Contact Email"] = form.primaryEmail;
      if (form.secondaryEmail) payload["Secondary Contact Email"] = form.secondaryEmail;

      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      await createResource(payload);

      setSubmitSuccess(true);
      clearCache();
      setForm({
        organization: "",
        contact: "",
        website: "",
        primaryEmail: "",
        secondaryEmail: "",
        costs: "",
        uninsured: "",
        supportOptions: [],
        notes: "",
        approvedByAvalon: false,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit resource");
    } finally {
      setSubmitting(false);
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
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Header showStaffLink={false} />
      <main className="main-content">
        <div className="staff-area">
          <div className="staff-header">
            <h2>Add New Resource</h2>
            <p>Fill in the details below to add a new organization to the resource hub. Fields marked * are required.</p>
            <a href="/" className="back-link">← View Public Hub</a>
          </div>

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
            <div className="form-section">
              <h3>Organization Info</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="org">Organization Name *</label>
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
                  <label htmlFor="website">Website URL</label>
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
                  <label htmlFor="primaryEmail">Primary Contact Email</label>
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
                  <label htmlFor="costs">Cost Structure</label>
                  <select
                    id="costs"
                    value={form.costs}
                    onChange={(e) => setForm((f) => ({ ...f, costs: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Select cost type...</option>
                    {COST_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    <option value="Other">Other</option>
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
                <label>Support Options (select all that apply)</label>
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
                  <span>Approved by Avalon</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={submitting} className="submit-btn">
                {submitting ? "Adding Resource..." : "Add Resource to Hub"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
