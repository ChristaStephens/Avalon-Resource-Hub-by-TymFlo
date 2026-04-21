const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || "";
const TABLE_ID = import.meta.env.VITE_AIRTABLE_TABLE_ID || "tblDowngy9UNJQhYc";
const PAT = import.meta.env.VITE_AIRTABLE_PAT || "";

export const AIRTABLE_CONFIGURED = !!(BASE_ID && PAT);

const CACHE_KEY = "avalon_resources_cache";
const CACHE_ALL_KEY = "avalon_resources_all_cache";
const CACHE_TTL = 60 * 60 * 1000;

// Legacy prefix used before the dedicated checkbox column existed
const LEGACY_REMOVED_PREFIX = "[REMOVED] ";

export interface Resource {
  id: string;
  organization: string;
  contact: string;
  website: string;
  primaryContactEmail: string;
  secondaryContactEmail: string;
  costs: string;
  uninsured: string;
  supportOptions: string[];
  approvedByAvalon: boolean;
  notes: string;
  removed: boolean;
  legacyRemoved: boolean;
  logo?: string;
}

interface CacheEntry {
  timestamp: number;
  data: Resource[];
}

function getCache(key: string): Resource[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(key: string, data: Resource[]) {
  try {
    const entry: CacheEntry = { timestamp: Date.now(), data };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {}
}

export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_ALL_KEY);
}

function parseRecord(record: Record<string, unknown>): Resource {
  const fields = record.fields as Record<string, unknown>;

  const supportRaw = fields["Support Options"];
  let supportOptions: string[] = [];
  if (Array.isArray(supportRaw)) {
    supportOptions = supportRaw.map(String);
  } else if (typeof supportRaw === "string") {
    supportOptions = [supportRaw];
  }

  const attachments = fields["Logo"] as Array<{ url: string }> | undefined;
  const logo = attachments?.[0]?.url;

  const rawNotes = String(fields["NOTES"] || "");

  // Primary: dedicated "Removed by Avalon Admin" checkbox column
  // Fallback: legacy [REMOVED] prefix in notes (for backward compatibility)
  const removedByCheckbox = !!fields["Removed by Avalon Admin"];
  const removedByLegacy = rawNotes.startsWith(LEGACY_REMOVED_PREFIX);
  const removed = removedByCheckbox || removedByLegacy;

  // Strip legacy prefix from displayed notes
  const notes = removedByLegacy ? rawNotes.slice(LEGACY_REMOVED_PREFIX.length) : rawNotes;

  return {
    id: record.id as string,
    organization: String(fields["Organization"] || ""),
    contact: String(fields["Contact"] || ""),
    website: String(fields["Website"] || ""),
    primaryContactEmail: String(fields["Primary Contact Email"] || ""),
    secondaryContactEmail: String(fields["Secondary Contact Email"] || ""),
    costs: String(fields["Costs "] || fields["Costs"] || ""),
    uninsured: String(fields["Uninsured"] || ""),
    supportOptions,
    approvedByAvalon: !!(fields["Approved by Avalon Admin"] || fields["Approved by Avalon Adm..."]),
    notes,
    removed,
    legacyRemoved: removedByLegacy,
    logo,
  };
}

async function fetchAll(): Promise<Resource[]> {
  if (!BASE_ID || !PAT) return [];

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?pageSize=100`;
  const allRecords: Resource[] = [];
  let offset: string | undefined;

  do {
    const fetchUrl = offset ? `${url}&offset=${offset}` : url;
    const response = await fetch(fetchUrl, {
      headers: { Authorization: `Bearer ${PAT}` },
    });
    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json() as { records: Record<string, unknown>[]; offset?: string };
    allRecords.push(...data.records.map(parseRecord));
    offset = data.offset;
  } while (offset);

  return allRecords;
}

export async function fetchResources(forceRefresh = false): Promise<Resource[]> {
  if (!forceRefresh) {
    const cached = getCache(CACHE_KEY);
    if (cached) return cached;
  }

  const all = await fetchAll();
  const active = all.filter((r) => !r.removed);
  setCache(CACHE_KEY, active);
  return active;
}

export async function fetchAllResources(forceRefresh = false): Promise<Resource[]> {
  if (!forceRefresh) {
    const cached = getCache(CACHE_ALL_KEY);
    if (cached) return cached;
  }

  const all = await fetchAll();
  setCache(CACHE_ALL_KEY, all);
  return all;
}

export async function createResource(fields: Record<string, unknown>): Promise<void> {
  const writePAT = import.meta.env.VITE_AIRTABLE_WRITE_PAT || PAT;
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${writePAT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create record: ${response.status} ${response.statusText}`);
  }

  clearCache();
}

export async function removeResource(resource: Resource): Promise<void> {
  const writePAT = import.meta.env.VITE_AIRTABLE_WRITE_PAT || PAT;
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${resource.id}`;

  // Check the "Removed by Avalon Admin" checkbox and write clean notes
  // (stripping any legacy [REMOVED] prefix while we're here).
  const patchFields: Record<string, unknown> = {
    "Removed by Avalon Admin": true,
    "NOTES": resource.notes,
  };

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${writePAT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: patchFields }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Failed to remove resource: ${response.status} ${detail || response.statusText}`);
  }

  clearCache();
}

export async function restoreResource(resource: Resource): Promise<void> {
  const writePAT = import.meta.env.VITE_AIRTABLE_WRITE_PAT || PAT;
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${resource.id}`;

  // Uncheck "Removed by Avalon Admin" (null = unchecked in Airtable API)
  // and write back clean notes to strip any legacy [REMOVED] prefix.
  const patchFields: Record<string, unknown> = {
    "Removed by Avalon Admin": null,
    "NOTES": resource.notes,
  };

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${writePAT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: patchFields }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Failed to restore resource: ${response.status} ${detail || response.statusText}`);
  }

  clearCache();
}
