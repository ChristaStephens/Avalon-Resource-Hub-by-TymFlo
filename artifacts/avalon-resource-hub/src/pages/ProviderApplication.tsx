import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createResource, AIRTABLE_CONFIGURED } from "@/lib/airtable";

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT || "";

const EMPTY_FORM = {
  organization: "",
  contact: "",
  website: "",
  primaryEmail: "",
  secondaryEmail: "",
  notes: "",
};

export default function ProviderApplication() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.organization.trim()) { setError("Organization Name is required."); return; }
    if (!form.website.trim()) { setError("Website URL is required."); return; }
    if (!form.primaryEmail.trim()) { setError("Primary Contact Email is required."); return; }

    setSubmitting(true);
    try {
      // 1. Create unapproved Airtable record (pending staff review)
      const payload: Record<string, unknown> = {
        Organization: form.organization,
        "Approved by Avalon Admin": false,
      };
      if (form.contact) payload["Contact"] = form.contact;
      if (form.website) payload["Website"] = form.website;
      if (form.primaryEmail) payload["Primary Contact Email"] = form.primaryEmail;
      if (form.secondaryEmail) payload["Secondary Contact Email"] = form.secondaryEmail;
      if (form.notes) payload["NOTES"] = form.notes;

      await createResource(payload);

      // 2. Send email notification via Formspree (gracefully skipped if not configured)
      if (FORMSPREE_ENDPOINT) {
        await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            subject: `New Provider Application: ${form.organization}`,
            organization: form.organization,
            contact: form.contact || "(not provided)",
            website: form.website,
            email: form.primaryEmail,
            secondaryEmail: form.secondaryEmail || "(not provided)",
            notes: form.notes || "(none)",
            message: `A new organization has applied to be listed on the Avalon Resource Hub and is awaiting your review in the Staff Area.\n\nOrganization: ${form.organization}\nContact: ${form.contact || "(not provided)"}\nWebsite: ${form.website}\nEmail: ${form.primaryEmail}\nNotes: ${form.notes || "(none)"}`,
          }),
        }).catch(() => {
          // Email failure is non-blocking — submission still succeeded
        });
      }

      setSubmitted(true);
      setForm(EMPTY_FORM);
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
            <h2>Application Received!</h2>
            <p>
              Thank you for your interest in being listed on the Avalon Resource Hub.
              Our team will review your application and reach out if we have any questions.
            </p>
            <p className="provider-success-note">
              Once approved, your organization will automatically appear on the public Resource Hub.
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
            <h2>Become a Resource Provider</h2>
            <p>
              Is your organization a resource for sexual assault survivors in the Detroit area?
              Submit your information below and Avalon's team will review your application.
              You'll appear on the public Resource Hub once approved.
            </p>
          </div>

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
            <div className="form-section">
              <h3>Organization Info</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="p-org">Organization Name <span className="required-star">*</span></label>
                  <input
                    id="p-org"
                    type="text"
                    required
                    value={form.organization}
                    onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                    placeholder="e.g. Birth Detroit"
                    className="form-input"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="p-contact">Contact Name</label>
                  <input
                    id="p-contact"
                    type="text"
                    value={form.contact}
                    onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                    placeholder="e.g. Jane Smith"
                    className="form-input"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="p-website">Website URL <span className="required-star">*</span></label>
                  <input
                    id="p-website"
                    type="url"
                    required
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                    placeholder="https://example.org"
                    className="form-input"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="p-email">Primary Contact Email <span className="required-star">*</span></label>
                  <input
                    id="p-email"
                    type="email"
                    required
                    value={form.primaryEmail}
                    onChange={(e) => setForm((f) => ({ ...f, primaryEmail: e.target.value }))}
                    placeholder="contact@example.org"
                    className="form-input"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="p-email2">Secondary Contact Email</label>
                  <input
                    id="p-email2"
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
              <h3>About Your Organization</h3>
              <div className="form-field full-width">
                <label htmlFor="p-notes">
                  Description <span className="label-hint">What services do you provide? Who do you serve?</span>
                </label>
                <textarea
                  id="p-notes"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Tell us about the services your organization provides and the communities you serve..."
                  className="form-textarea"
                  rows={5}
                />
              </div>
            </div>

            <div className="provider-privacy-note">
              🔒 Your information will only be used to evaluate your application. Nothing is published without Avalon's review and approval.
            </div>

            <div className="form-actions">
              <button type="submit" disabled={submitting || !AIRTABLE_CONFIGURED} className="submit-btn">
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
