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
  keywords: string[];
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

  // Parse Keywords field — free-text comma-separated list
  const keywordsRaw = fields["Keywords"];
  let keywords: string[] = [];
  if (typeof keywordsRaw === "string" && keywordsRaw.trim()) {
    keywords = keywordsRaw.split(",").map((k) => k.trim()).filter(Boolean);
  } else if (Array.isArray(keywordsRaw)) {
    keywords = keywordsRaw.map(String).filter(Boolean);
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
    keywords,
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
  // Only show resources approved by Avalon staff AND not removed
  const active = all.filter((r) => !r.removed && r.approvedByAvalon);
  setCache(CACHE_KEY, active);
  return active;
}

export async function fetchPendingApplications(): Promise<Resource[]> {
  const all = await fetchAll();
  return all.filter((r) => !r.approvedByAvalon && !r.removed);
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

export async function createResource(fields: Record<string, unknown>): Promise<string> {
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

  const data = await response.json() as { id: string };
  clearCache();
  return data.id;
}

export async function uploadLogoAttachment(recordId: string, file: File): Promise<void> {
  const writePAT = import.meta.env.VITE_AIRTABLE_WRITE_PAT || PAT;
  // Encode file to base64
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  const url = `https://content.airtable.com/v0/${BASE_ID}/${recordId}/Logo/uploadAttachment`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${writePAT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contentType: file.type || "image/png",
      filename: file.name,
      file: base64,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Logo upload failed: ${response.status} ${detail || response.statusText}`);
  }
}

export async function approveResource(resource: Resource): Promise<void> {
  const writePAT = import.meta.env.VITE_AIRTABLE_WRITE_PAT || PAT;
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${resource.id}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${writePAT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: { "Approved by Avalon Admin": true } }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Failed to approve resource: ${response.status} ${detail || response.statusText}`);
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
