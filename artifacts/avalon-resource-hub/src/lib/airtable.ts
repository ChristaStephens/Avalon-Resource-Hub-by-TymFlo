const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || "";
const TABLE_ID = import.meta.env.VITE_AIRTABLE_TABLE_ID || "tblDowngy9UNJQhYc";
const PAT = import.meta.env.VITE_AIRTABLE_PAT || "";

export const AIRTABLE_CONFIGURED = !!(BASE_ID && PAT);

const CACHE_KEY = "avalon_resources_cache";
const CACHE_TTL = 60 * 60 * 1000;

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
  logo?: string;
}

interface CacheEntry {
  timestamp: number;
  data: Resource[];
}

function getCache(): Resource[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(data: Resource[]) {
  try {
    const entry: CacheEntry = { timestamp: Date.now(), data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
  }
}

export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
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
    notes: String(fields["NOTES"] || ""),
    logo,
  };
}

export async function fetchResources(forceRefresh = false): Promise<Resource[]> {
  if (!forceRefresh) {
    const cached = getCache();
    if (cached) return cached;
  }

  if (!BASE_ID || !PAT) {
    return [];
  }

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?pageSize=100`;

  const allRecords: Resource[] = [];
  let offset: string | undefined;

  do {
    const fetchUrl = offset ? `${url}&offset=${offset}` : url;
    const response = await fetch(fetchUrl, {
      headers: {
        Authorization: `Bearer ${PAT}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { records: Record<string, unknown>[]; offset?: string };
    const records = data.records.map(parseRecord);
    allRecords.push(...records);
    offset = data.offset;
  } while (offset);

  setCache(allRecords);
  return allRecords;
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
