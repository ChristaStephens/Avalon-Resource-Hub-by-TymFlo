import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SupportOptionPicker } from "@/components/SupportOptionPicker";
import { fetchResources, updateResource, AIRTABLE_CONFIGURED, Resource } from "@/lib/airtable";

const NOTIFY_ENDPOINT = "/api/notify";

// Values must match Airtable's stored multi-select options exactly (including trailing spaces).
// Labels in the UI are rendered with .trim() — see the JSX below.
const COST_OPTIONS = [
  "Free - No costs ",
  "Free prenatal care; insurance billed for well person gyn ",
  "Insurance based",
  "Will help with insurance sign up",
  "Offers - Free prenatals ",
  "Based on EGA - Financial Assistance Available",
];

export default function RequestEdit() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const recordId = params.get("id") || "";

  const [resource, setResource] = useState<Resource | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    organization: "",
    contact: "",
    website: "",
    primaryEmail: "",
    secondaryEmail: "",
    costs: [] as string[],
    uninsured: "",
    supportOptions: [] as string[],
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recordId) {
      setLoadError("No resource ID provided. Please go back and try again.");
      setLoading(false);
      return;
    }

    // Fetch from the already-approved resources list
    fetchResources()
      .then((resources) => {
        const found = resources.find((r) => r.id === recordId);
        if (!found) {
          setLoadError("Resource not found. It may have been removed or the link is incorrect.");
          setLoading(false);
          return;
        }
        setResource(found);
        setForm({
          organization: found.organization,
          contact: found.contact,
          website: found.website,
          primaryEmail: found.primaryContactEmail,
          secondaryEmail: found.secondaryContactEmail,
          costs: Array.isArray(found.costs) ? [...found.costs] : [],
          uninsured: found.uninsured,
          supportOptions: [...found.supportOptions],
          notes: found.notes,
        });
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : "Failed to load resource.");
        setLoading(false);
      });
  }, [recordId]);

  const handleCostToggle = (opt: string) => {
    setForm((f) => ({
      ...f,
      costs: f.costs.includes(opt)
        ? f.costs.filter((c) => c !== opt)
        : [...f.costs, opt],
    }));
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
    setError(null);

    if (!form.organization.trim()) { setError("Organization Name is required."); return; }
    if (form.supportOptions.length === 0) { setError("Please select at least one Support Option."); return; }

    setSubmitting(true);
    try {
      const notesPrefix = `EDIT REQUEST for: ${resource?.organization || form.organization} | `;
      const notesValue = notesPrefix + (form.notes || "");

      // Normalize each cost value to the canonical COST_OPTIONS string (which exactly
      // matches Airtable's stored option names, including any trailing spaces).
      // This guards against any state path that might have produced a trimmed value.
      const normalizedCosts = form.costs.map(
        (c) => COST_OPTIONS.find((o) => o.trim() === c.trim()) ?? c
      );

      const payload: Record<string, unknown> = {
        Organization: form.organization,
        Contact: form.contact,
        Website: form.website,
        "Primary Contact Email": form.primaryEmail,
        "Secondary Contact Email": form.secondaryEmail,
        "Support Options": form.supportOptions,
        Costs: normalizedCosts,
        Uninsured: form.uninsured,
        "Approved by Avalon Admin": false,
        NOTES: notesValue,
      };

      await updateResource(recordId, payload);

      // Send email notification (gracefully non-blocking)
      await fetch(NOTIFY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `Edit Request: ${form.organization}`,
          message: [
            `An edit request has been submitted for: ${resource?.organization || form.organization}`,
            "Please review the updated information below and approve it in the Staff Area.",
            "",
            `Organization: ${form.organization}`,
            `Contact: ${form.contact || "(not provided)"}`,
            `Website: ${form.website}`,
            `Primary Email: ${form.primaryEmail}`,
            `Secondary Email: ${form.secondaryEmail || "(not provided)"}`,
            `Cost Structure: ${form.costs.join(", ")}`,
            `Accepts Uninsured: ${form.uninsured || "(not specified)"}`,
            `Support Options: ${form.supportOptions.join(", ")}`,
            `Notes: ${form.notes || "(none)"}`,
          ].join("\n"),
        }),
      }).catch(() => {
        // Email failure is non-blocking
      });

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-wrapper">
        <Header />
        <main className="main-content">
          <div className="provider-success">
            <div className="provider-success-icon">✓</div>
            <h2>Update Request Received</h2>
            <p>
              Your update request has been received. Avalon's team will review the changes
              and update the listing once approved.
            </p>
            <p className="provider-success-note">
              Thank you for helping keep the Resource Hub accurate.
            </p>
            <button className="provider-back-btn" onClick={() => navigate("/")}>
              ← Back to Resource Hub
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <div className="provider-page">
          <div className="provider-page-header">
            <button className="provider-back-link" onClick={() => navigate("/")}>
              ← Back to Resource Hub
            </button>
            <h2>Request a Listing Update</h2>
            <p>
              Is your organization's information out of date? Edit the fields below and
              submit — Avalon staff will review and approve the changes before they go live.
            </p>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading listing details…</p>
            </div>
          )}

          {loadError && (
            <div className="error-banner" style={{ marginBottom: 24 }}>
              ⚠️ {loadError}
            </div>
          )}

          {!loading && !loadError && (
            <>
              {!AIRTABLE_CONFIGURED && (
                <div className="error-banner" style={{ marginBottom: 24 }}>
                  ⚠️ This form is not fully configured yet. Please contact Avalon staff directly.
                </div>
              )}

              {error && (
                <div className="error-banner" style={{ marginBottom: 24 }}>
                  ⚠️ {error}
                  <button onClick={() => setError(null)} className="dismiss-btn">Dismiss</button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="staff-form">

                {/* ── Organization Info ── */}
                <div className="form-section">
                  <h3>Organization Info</h3>
                  <div className="form-grid">
                    <div className="form-field">
                      <label htmlFor="re-org">Organization Name <span className="required-star">*</span></label>
                      <input
                        id="re-org"
                        type="text"
                        required
                        value={form.organization}
                        onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="re-contact">Contact Name</label>
                      <input
                        id="re-contact"
                        type="text"
                        value={form.contact}
                        onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="re-website">Website URL</label>
                      <input
                        id="re-website"
                        type="text"
                        value={form.website}
                        onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="re-email">Primary Contact Email</label>
                      <input
                        id="re-email"
                        type="email"
                        value={form.primaryEmail}
                        onChange={(e) => setForm((f) => ({ ...f, primaryEmail: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="re-email2">Secondary Contact Email</label>
                      <input
                        id="re-email2"
                        type="email"
                        value={form.secondaryEmail}
                        onChange={(e) => setForm((f) => ({ ...f, secondaryEmail: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Services & Cost ── */}
                <div className="form-section">
                  <h3>Services &amp; Cost</h3>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Cost Structure <span className="label-hint">select all that apply</span></label>
                      <div className="cost-option-list">
                        {COST_OPTIONS.map((o) => (
                          <label key={o} className="cost-option-item">
                            <input
                              type="checkbox"
                              checked={form.costs.includes(o)}
                              onChange={() => handleCostToggle(o)}
                            />
                            <span>{o.trim()}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="form-field">
                      <label htmlFor="re-uninsured">Accepts Uninsured Patients?</label>
                      <select
                        id="re-uninsured"
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

                  <div className="form-field full-width" style={{ marginTop: 16 }}>
                    <label>Support Options <span className="required-star">*</span> <span className="label-hint">select all that apply</span></label>
                    <SupportOptionPicker
                      selected={form.supportOptions}
                      onChange={handleSupportToggle}
                    />
                  </div>
                </div>

                {/* ── About ── */}
                <div className="form-section">
                  <h3>About Your Organization</h3>
                  <div className="form-field full-width">
                    <label htmlFor="re-notes">
                      Description <span className="label-hint">What services do you provide? Who do you serve?</span>
                    </label>
                    <textarea
                      id="re-notes"
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      className="form-textarea"
                      rows={5}
                    />
                  </div>
                </div>

                <div className="provider-privacy-note">
                  🔒 Your update will be reviewed by Avalon staff before any changes go live on the Resource Hub.
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={submitting || !AIRTABLE_CONFIGURED} className="submit-btn">
                    {submitting ? "Submitting…" : "Submit Update Request"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
