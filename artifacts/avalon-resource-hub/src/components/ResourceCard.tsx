import { Resource } from "@/lib/airtable";

const MAX_VISIBLE_TAGS = 4;

interface ResourceCardProps {
  resource: Resource;
  onCardClick: (resource: Resource) => void;
}

export function ResourceCard({ resource, onCardClick }: ResourceCardProps) {
  const visibleTags = resource.supportOptions.slice(0, MAX_VISIBLE_TAGS);
  const extraCount = resource.supportOptions.length - MAX_VISIBLE_TAGS;

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't open modal when clicking "Visit Website"
    if (resource.website) {
      let url = resource.website;
      if (!url.startsWith("http")) url = "https://" + url;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="resource-card resource-card--clickable" onClick={() => onCardClick(resource)}>
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

        {visibleTags.length > 0 && (
          <div className="resource-tags">
            {visibleTags.map((opt) => (
              <span key={opt} className="resource-tag">{opt}</span>
            ))}
            {extraCount > 0 && (
              <span className="resource-tag resource-tag--more">+{extraCount} more</span>
            )}
          </div>
        )}

        {resource.notes && (
          <p className="resource-notes">{resource.notes}</p>
        )}

        <p className="resource-card-cta">Click to see full details</p>
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
