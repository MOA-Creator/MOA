const KEY = "entries";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

function isValidEntries(entries) {
  if (!Array.isArray(entries)) return false;
  return entries.every(
    (e) =>
      e &&
      typeof e.version === "string" &&
      typeof e.date === "string" &&
      Array.isArray(e.notes) &&
      e.notes.every((n) => typeof n === "string")
  );
}

export async function onRequestGet({ env }) {
  if (!env.CHANGELOG) {
    return json({ error: "KV namespace binding CHANGELOG is not configured" }, 500);
  }
  const entries = (await env.CHANGELOG.get(KEY, "json")) || [];
  return json({ entries });
}

export async function onRequestPost({ request, env }) {
  if (!env.CHANGELOG) {
    return json({ error: "KV namespace binding CHANGELOG is not configured" }, 500);
  }
  if (!env.CHANGELOG_ADMIN_TOKEN) {
    return json({ error: "CHANGELOG_ADMIN_TOKEN is not set" }, 500);
  }
  if (request.headers.get("x-admin-token") !== env.CHANGELOG_ADMIN_TOKEN) {
    return json({ error: "Invalid admin token" }, 401);
  }

  let parsed;
  try {
    parsed = await request.json();
  } catch {
    return json({ error: "Malformed JSON body" }, 400);
  }

  if (!isValidEntries(parsed.entries)) {
    return json({ error: "entries must be an array of { version, date, notes[] } objects" }, 400);
  }

  await env.CHANGELOG.put(KEY, JSON.stringify(parsed.entries));
  return json({ ok: true });
}
