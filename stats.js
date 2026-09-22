// Server-side proxy: holds the real GoatCounter token in config.js
// (this repo must stay private) and returns only the computed numbers -
// the token itself never reaches the browser.
const { GOATCOUNTER_TOKEN } = require("./config.js");

const SITE = "moa";
const ALLOWED_ORIGIN = "https://moonlight-auto-clicker.runs-on.dev";

const SEARCH_ENGINES = [
  "google", "bing", "duckduckgo", "yahoo", "baidu", "yandex",
  "ecosia", "startpage", "brave search", "qwant", "ask.com",
];

async function apiGet(path) {
  const res = await fetch(`https://${SITE}.goatcounter.com/api/v0${path}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GOATCOUNTER_TOKEN}`,
    },
  });
  if (!res.ok) {
    throw new Error(`GoatCounter API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

exports.handler = async () => {
  const cors = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Content-Type": "application/json",
  };

  try {
    const start = "2020-01-01T00:00:00Z";
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

    const stats = { visits, unique: visits, fromSearch, downloads };

    return { statusCode: 200, headers: cors, body: JSON.stringify(stats) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};
