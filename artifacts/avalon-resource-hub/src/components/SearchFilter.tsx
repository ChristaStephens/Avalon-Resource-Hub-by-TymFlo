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
    <div className="search-filter-panel">
      <div className="search-row">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search resources by name, service, or notes..."
            className="search-input"
            aria-label="Search resources"
          />
        </div>
      </div>

      <div className="filter-row">
        <select
          value={selectedSupport}
          onChange={(e) => onSupportChange(e.target.value)}
          className="filter-select"
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
          className="filter-select"
          aria-label="Filter by cost"
        >
          <option value="">All Cost Options</option>
          {costOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        <label className="uninsured-toggle">
          <input
            type="checkbox"
            checked={uninsuredOnly}
            onChange={(e) => onUninsuredChange(e.target.checked)}
          />
          <span>Accepts Uninsured</span>
        </label>

        {hasFilters && (
          <button onClick={handleClear} className="clear-filters-btn">
            Clear Filters
          </button>
        )}
      </div>

      <div className="results-count">
        Showing {filteredCount} of {totalCount} resources
      </div>
    </div>
  );
}
