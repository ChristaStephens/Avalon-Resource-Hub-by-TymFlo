import { useState, useEffect, useMemo } from "react";
import { fetchResources, Resource, AIRTABLE_CONFIGURED, clearCache } from "@/lib/airtable";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ResourceCard } from "@/components/ResourceCard";
import { SearchFilter } from "@/components/SearchFilter";

export default function PublicHub() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupport, setSelectedSupport] = useState("");
  const [selectedCost, setSelectedCost] = useState("");
  const [uninsuredOnly, setUninsuredOnly] = useState(false);

  const loadResources = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchResources(force);
      setResources(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const supportOptions = useMemo(() => {
    const all = new Set<string>();
    resources.forEach((r) => r.supportOptions.forEach((s) => all.add(s)));
    return Array.from(all).sort();
  }, [resources]);

  const costOptions = useMemo(() => {
    const all = new Set<string>();
    resources.forEach((r) => { if (r.costs) all.add(r.costs); });
    return Array.from(all).sort();
  }, [resources]);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          r.organization.toLowerCase().includes(q) ||
          r.notes.toLowerCase().includes(q) ||
          r.supportOptions.some((s) => s.toLowerCase().includes(q)) ||
          r.costs.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedSupport && !r.supportOptions.includes(selectedSupport)) return false;
      if (selectedCost && r.costs !== selectedCost) return false;
      if (uninsuredOnly && r.uninsured !== "Yes") return false;
      return true;
    });
  }, [resources, searchQuery, selectedSupport, selectedCost, uninsuredOnly]);

  if (!AIRTABLE_CONFIGURED) {
    return (
      <div className="page-wrapper">
        <Header />
        <main className="main-content">
          <div className="setup-notice">
            <div className="setup-icon">⚙️</div>
            <h2>Setup Required</h2>
            <p>The Airtable connection has not been configured yet.</p>
            <p>Please set the following environment variables:</p>
            <ul>
              <li><code>VITE_AIRTABLE_BASE_ID</code> — your Airtable Base ID (starts with "app...")</li>
              <li><code>VITE_AIRTABLE_PAT</code> — your read-only Personal Access Token</li>
              <li><code>VITE_AIRTABLE_TABLE_ID</code> — (optional, defaults to tblDowngy9UNJQhYc)</li>
            </ul>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Header />

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSupport={selectedSupport}
        onSupportChange={setSelectedSupport}
        selectedCost={selectedCost}
        onCostChange={setSelectedCost}
        uninsuredOnly={uninsuredOnly}
        onUninsuredChange={setUninsuredOnly}
        supportOptions={supportOptions}
        costOptions={costOptions}
        totalCount={resources.length}
        filteredCount={filtered.length}
      />

      <main className="main-content">
        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading resources...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>⚠️ {error}</p>
            <button onClick={() => loadResources(true)} className="retry-btn">Try Again</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <p>No resources match your search. Try adjusting the filters.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="resources-grid">
            {filtered.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        )}

        {lastRefresh && (
          <div className="refresh-footer">
            <span>Data cached — last updated {lastRefresh.toLocaleTimeString()}</span>
            <button
              onClick={() => { clearCache(); loadResources(true); }}
              className="refresh-btn"
            >
              Refresh Now
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
