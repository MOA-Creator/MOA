const SITE = "moa";

const SEARCH_ENGINES = [
  "google", "bing", "duckduckgo", "yahoo", "baidu", "yandex",
  "ecosia", "startpage", "brave search", "qwant", "ask.com",
];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

async function apiGet(path, token) {
  const res = await fetch(`https://${SITE}.goatcounter.com/api/v0${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error(`GoatCounter API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function onRequestGet({ env }) {
  const token = env.GOATCOUNTER_TOKEN;
  if (!token) {
    return json({ error: "GOATCOUNTER_TOKEN is not set" }, 500);
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

    return json({ visits, unique: visits, fromSearch, downloads });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
