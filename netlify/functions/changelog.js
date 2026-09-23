const { getStore } = require("@netlify/blobs");

const ALLOWED_ORIGIN = "https://moonlight-auto-clicker.runs-on.dev";
const STORE_NAME = "moa-changelog";
const KEY = "entries";

function baseHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type, x-admin-token",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

function isValidEntries(entries) {
  if (!Array.isArray(entries)) return false;
  return entries.every((e) =>
    e &&
    typeof e.version === "string" &&
    typeof e.date === "string" &&
    Array.isArray(e.notes) &&
    e.notes.every((n) => typeof n === "string")
  );
}

function getBlobsStore() {
  const siteID = process.env.BLOBS_SITE_ID;
  const token = process.env.BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: STORE_NAME, siteID, token });
  }
  return getStore(STORE_NAME);
}

exports.handler = async (event) => {
  const headers = baseHeaders();

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  let store;
  try {
    store = getBlobsStore();
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error:
          "Netlify Blobs isn't configured. Set BLOBS_SITE_ID and BLOBS_TOKEN environment variables on this site.",
      }),
    };
  }

  if (event.httpMethod === "GET") {
    const entries = (await store.get(KEY, { type: "json" })) || [];
    return { statusCode: 200, headers, body: JSON.stringify({ entries }) };
  }

  if (event.httpMethod === "POST") {
    const token = process.env.CHANGELOG_ADMIN_TOKEN;
    if (!token) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "CHANGELOG_ADMIN_TOKEN environment variable is not set on the Netlify site",
        }),
      };
    }

    const provided = event.headers["x-admin-token"] || event.headers["X-Admin-Token"];
    if (provided !== token) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid admin token" }) };
    }

    let parsed;
    try {
      parsed = JSON.parse(event.body || "{}");
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Malformed JSON body" }) };
    }

    if (!isValidEntries(parsed.entries)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "entries must be an array of { version, date, notes[] } objects",
        }),
      };
    }

    await store.set(KEY, JSON.stringify(parsed.entries));
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
};
