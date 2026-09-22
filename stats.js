// Pulls live numbers from the GoatCounter API for the dev stats page.
import { GOATCOUNTER_SITE, GOATCOUNTER_TOKEN } from "./goatcounter-config.js";

const API = `https://${GOATCOUNTER_SITE}.goatcounter.com/api/v0`;
const HEADERS = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${GOATCOUNTER_TOKEN}`,
};

// Referrer names GoatCounter groups search engines under (case-insensitive).
const SEARCH_ENGINES = [
  "google", "bing", "duckduckgo", "yahoo", "baidu", "yandex",
  "ecosia", "startpage", "brave search", "qwant", "ask.com",
];

async function apiGet(path) {
  const res = await fetch(`${API}${path}`, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`GoatCounter API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function loadStats() {
  const start = "2020-01-01T00:00:00Z"; // effectively "all time"
  const end = new Date().toISOString();
  const range = `start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;

  const [total, refs, hits] = await Promise.all([
    apiGet(`/stats/total?${range}`),
    apiGet(`/stats/toprefs?${range}&limit=100`),
    apiGet(`/stats/hits?${range}&limit=100`),
  ]);

  const events = total.total_events || 0;
  const visits = (total.total || 0) - events;

  const fromSearch = (refs.refs || [])
    .filter((r) => SEARCH_ENGINES.includes(String(r.name || "").toLowerCase()))
    .reduce((sum, r) => sum + (r.count || 0), 0);

  const downloadHit = (hits.hits || []).find((h) => h.event && h.path === "download");
  const downloads = downloadHit ? downloadHit.count : 0;

  // GoatCounter only stores deduplicated visitor counts (no separate raw
  // pageview number since v2), so "visits" and "unique visitors" are the
  // same figure here - that's a GoatCounter limitation, not a bug.
  return { visits, unique: visits, fromSearch, downloads };
}
