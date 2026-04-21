interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedSupport: string;
  onSupportChange: (val: string) => void;
  selectedCost: string;
  onCostChange: (val: string) => void;
  uninsuredOnly: boolean;
  onUninsuredChange: (val: boolean) => void;
  supportOptions: string[];
  costOptions: string[];
  totalCount: number;
  filteredCount: number;
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  selectedSupport,
  onSupportChange,
  selectedCost,
  onCostChange,
  uninsuredOnly,
  onUninsuredChange,
  supportOptions,
  costOptions,
  totalCount,
  filteredCount,
}: SearchFilterProps) {
  const hasFilters = searchQuery || selectedSupport || selectedCost || uninsuredOnly;

  const handleClear = () => {
    onSearchChange("");
    onSupportChange("");
    onCostChange("");
    onUninsuredChange(false);
  };

  return (
    <div className="hero-search-section">
      <div className="hero-search-inner">
        <div className="hero-text">
          <h2 className="hero-heading">Find the support you need.</h2>
          <p className="hero-subtext">
            A safe, confidential space to explore local resources — free to search anytime,
            no account required. You set the pace.
          </p>
        </div>

        <div className="hero-search-bar-wrap">
          <div className="hero-search-input-wrap">
            <svg className="hero-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by organization name, service, or keyword..."
              className="hero-search-input"
              aria-label="Search resources"
            />
            {searchQuery && (
              <button className="hero-search-clear" onClick={() => onSearchChange("")} aria-label="Clear search">✕</button>
            )}
          </div>
        </div>

        <hr className="hero-filter-divider" />

        <div className="hero-filter-row">
          <select
            value={selectedSupport}
            onChange={(e) => onSupportChange(e.target.value)}
            className="hero-filter-select"
            aria-label="Filter by support type"
          >
            <option value="">All Support Types</option>
            {supportOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <select
            value={selectedCost}
            onChange={(e) => onCostChange(e.target.value)}
            className="hero-filter-select"
            aria-label="Filter by cost"
          >
            <option value="">All Cost Options</option>
            {costOptions.map((opt) => (
              <option key={opt} value={opt}>{opt.trim()}</option>
            ))}
          </select>

          <label className="hero-uninsured-toggle">
            <input
              type="checkbox"
              checked={uninsuredOnly}
              onChange={(e) => onUninsuredChange(e.target.checked)}
            />
            <span>Accepts Uninsured</span>
          </label>

          {hasFilters && (
            <button onClick={handleClear} className="hero-clear-btn">
              Clear all
            </button>
          )}

          <span className="hero-results-count">
            {filteredCount} of {totalCount} resources
          </span>
        </div>
      </div>
    </div>
  );
}
