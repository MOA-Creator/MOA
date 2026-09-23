const ALLOWED_ORIGIN = "https://moonlight-auto-clicker.runs-on.dev";

function headers() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

function clean(v) {
  return String(v || "").trim().toLowerCase();
}

async function fetchCodes() {
  const repo = process.env.DEV_CODES_REPO;
  const path = process.env.DEV_CODES_PATH || "codes.json";
  const ref = process.env.DEV_CODES_REPO_REF || "main";
  const token = process.env.DEV_CODES_REPO_TOKEN;

  const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${ref}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3.raw",
      "User-Agent": "moa-dev-auth",
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub fetch failed (${res.status})`);
  }

  return res.json();
}

exports.handler = async (event) => {
  const h = headers();

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: h, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: h, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  if (!process.env.DEV_CODES_REPO || !process.env.DEV_CODES_REPO_TOKEN) {
    return {
      statusCode: 500,
      headers: h,
      body: JSON.stringify({
        error: "DEV_CODES_REPO and DEV_CODES_REPO_TOKEN environment variables are not set",
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: h, body: JSON.stringify({ error: "Malformed JSON body" }) };
  }

  let codes;
  try {
    codes = await fetchCodes();
  } catch (err) {
    return {
      statusCode: 502,
      headers: h,
      body: JSON.stringify({ error: "Couldn't reach the private codes repo" }),
    };
  }

  const ok =
    clean(body.code1) === clean(codes.code1) &&
    clean(body.code2) === clean(codes.code2);

  return { statusCode: ok ? 200 : 401, headers: h, body: JSON.stringify({ ok }) };
};
