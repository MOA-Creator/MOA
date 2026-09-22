// Server-side proxy: reads the GoatCounter token from a Netlify
// environment variable so it never has to be committed anywhere
// (public or private repo) and never reaches the browser.
//
// Set it in the Netlify dashboard:
//   Site configuration > Environment variables > GOATCOUNTER_TOKEN

const SITE = "moa";
const ALLOWED_ORIGIN = "https://moonlight-auto-clicker.runs-on.dev";

const SEARCH_ENGINES = [
  "google", "bing", "duckduckgo", "yahoo", "baidu", "yandex",
  "ecosia", "startpage", "brave search", "qwant", "ask.com",
];

async function apiGet(path, token) {
  const res = await fetch(`https://${SITE}.goatcounter.com/api/v0${path}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
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

  const token = process.env.GOATCOUNTER_TOKEN;
  if (!token) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({
        error: "GOATCOUNTER_TOKEN environment variable is not set on the Netlify site",
      }),
    };
  }

  try {
    const start = "2020-01-01T00:00:00Z";
    const end = new Date().toISOString();
    const range = `start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;

    const [total, refs, hits] = await Promise.all([
      apiGet(`/stats/total?${range}`, token),
      apiGet(`/stats/toprefs?${range}&limit=100`, token),
      apiGet(`/stats/hits?${range}&limit=100`, token),
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
