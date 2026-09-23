const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const clean = (v) => String(v || "").trim().toLowerCase();

async function fetchCodes(env) {
  const path = env.DEV_CODES_PATH || "codes.json";
  const ref = env.DEV_CODES_REPO_REF || "main";
  const url = `https://api.github.com/repos/${env.DEV_CODES_REPO}/contents/${path}?ref=${ref}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.DEV_CODES_REPO_TOKEN}`,
      Accept: "application/vnd.github.v3.raw",
      "User-Agent": "moa-dev-auth",
    },
  });

  if (!res.ok) throw new Error(`GitHub fetch failed (${res.status})`);
  return res.json();
}

export async function onRequestPost({ request, env }) {
  if (!env.DEV_CODES_REPO || !env.DEV_CODES_REPO_TOKEN) {
    return json({ error: "DEV_CODES_REPO and DEV_CODES_REPO_TOKEN are not set" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Malformed JSON body" }, 400);
  }

  let codes;
  try {
    codes = await fetchCodes(env);
  } catch {
    return json({ error: "Couldn't reach the private codes repo" }, 502);
  }

  const ok =
    clean(body.code1) === clean(codes.code1) &&
    clean(body.code2) === clean(codes.code2);

  return json({ ok }, ok ? 200 : 401);
}
