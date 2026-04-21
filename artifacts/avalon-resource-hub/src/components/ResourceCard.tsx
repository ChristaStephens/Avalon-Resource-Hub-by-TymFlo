import { Resource } from "@/lib/airtable";

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const handleWebsiteClick = () => {
    if (resource.website) {
      let url = resource.website;
      if (!url.startsWith("http")) url = "https://" + url;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="resource-card">
      <div className="resource-card-header">
        {resource.logo ? (
          <img src={resource.logo} alt={`${resource.organization} logo`} className="resource-logo" />
        ) : (
          <div className="resource-logo-placeholder">
            <span>{resource.organization.charAt(0)}</span>
          </div>
        )}
        <h3 className="resource-name">{resource.organization || "Unknown Organization"}</h3>
      </div>

      <div className="resource-card-body">
        {resource.costs && (
          <div className="resource-badge-row">
            <span className="resource-badge cost-badge">{resource.costs}</span>
            {resource.uninsured === "Yes" && (
              <span className="resource-badge uninsured-badge">Accepts Uninsured</span>
            )}
          </div>
        )}

        {resource.supportOptions.length > 0 && (
          <div className="resource-tags">
            {resource.supportOptions.map((opt) => (
              <span key={opt} className="resource-tag">{opt}</span>
            ))}
          </div>
        )}

        {resource.notes && (
          <p className="resource-notes">{resource.notes}</p>
        )}

        <div className="resource-contacts">
          {resource.contact && (
            <div className="resource-contact-row">
              <span className="contact-label">Contact:</span>
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
        </div>
      </div>

      {resource.website && (
        <div className="resource-card-footer">
          <button onClick={handleWebsiteClick} className="visit-website-btn">
            Visit Website →
          </button>
        </div>
      )}
    </div>
  );
}
