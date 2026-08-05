import { useEffect } from "react";
import { Resource } from "@/lib/airtable";

interface ResourceModalProps {
  resource: Resource;
  onClose: () => void;
}

export function ResourceModal({ resource, onClose }: ResourceModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleWebsiteClick = () => {
    if (resource.website) {
      let url = resource.website;
      if (!url.startsWith("http")) url = "https://" + url;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={resource.organization}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            {resource.logo ? (
              <img src={resource.logo} alt={`${resource.organization} logo`} className="modal-logo" />
            ) : (
              <div className="modal-logo-placeholder">
                <span>{resource.organization.charAt(0)}</span>
              </div>
            )}
            <div>
              <h2 className="modal-org-name">{resource.organization || "Unknown Organization"}</h2>
              {resource.website && (
                <a
                  href={resource.website.startsWith("http") ? resource.website : "https://" + resource.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-website-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  {resource.website}
                </a>
              )}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Scrollable body */}
        <div className="modal-body">
          {/* Cost + uninsured badges */}
          {(resource.costs || resource.uninsured === "Yes") && (
            <div className="modal-section">
              <div className="resource-badge-row">
                {resource.costs.map((c) => (
                  <span key={c} className="resource-badge cost-badge">{c.trim()}</span>
                ))}
                {resource.uninsured === "Yes" && (
                  <span className="resource-badge uninsured-badge">Accepts Uninsured</span>
                )}
              </div>
            </div>
          )}

          {/* All support options */}
          {resource.supportOptions.length > 0 && (
            <div className="modal-section">
              <h3 className="modal-section-label">Services & Support</h3>
              <div className="resource-tags">
                {resource.supportOptions.map((opt) => (
                  <span key={opt} className="resource-tag">{opt}</span>
                ))}
              </div>
            </div>
          )}

          {/* Notes / description */}
          {resource.notes && (
            <div className="modal-section">
              <h3 className="modal-section-label">About</h3>
              <p className="modal-notes">{resource.notes}</p>
            </div>
          )}

          {/* Contact info */}
          {(resource.contact || resource.primaryContactEmail || resource.secondaryContactEmail) && (
            <div className="modal-section">
              <h3 className="modal-section-label">Contact</h3>
              <div className="modal-contact-list">
                {resource.contact && (
                  <div className="resource-contact-row">
                    <span className="contact-label">Name:</span>
                    <span className="contact-value">{resource.contact}</span>
                  </div>
                )}
                {resource.primaryContactEmail && (
                  <div className="resource-contact-row">
                    <span className="contact-label">Email:</span>
                    <a href={`mailto:${resource.primaryContactEmail}`} className="contact-link">
                      {resource.primaryContactEmail}
                    </a>
                  </div>
                )}
                {resource.secondaryContactEmail && (
                  <div className="resource-contact-row">
                    <span className="contact-label">Alt Email:</span>
                    <a href={`mailto:${resource.secondaryContactEmail}`} className="contact-link">
                      {resource.secondaryContactEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer — Visit Website CTA */}
        {resource.website && (
          <div className="modal-footer">
            <button onClick={handleWebsiteClick} className="visit-website-btn">
              Visit Website →
            </button>
          </div>
        )}

        {/* Provider edit request — intentionally subtle, not for survivors */}
        <div className="modal-edit-request">
          <a
            href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/request-edit?id=${encodeURIComponent(resource.id)}`}
            className="modal-request-edit-link"
          >
            Is this your organization? Request an update →
          </a>
        </div>
      </div>
    </div>
  );
}
