export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/check-code" && request.method === "POST") {
      return handleCheckCode(request, env);
    }

    // Anything else: serve the static site exactly as before.
    return env.ASSETS.fetch(request);
  },
};

async function handleCheckCode(request, env) {
  try {
    const { code } = await request.json();
    const guess = String(code || "").trim().toLowerCase();

    const token = env.GITHUB_TOKEN;
    const owner = env.DEVCODES_OWNER;
    const repo = "DevCodes";
    const path = "Code.txt";

    if (!token || !owner) {
      return json({ ok: false, debug: "missing GITHUB_TOKEN or DEVCODES_OWNER" });
    }

    const ghRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.raw+json",
          "User-Agent": "moa-dev-gate",
        },
      }
    );

    if (!ghRes.ok) {
      return json({ ok: false, debug: `GitHub API status ${ghRes.status}` });
    }

    const text = await ghRes.text();

    const validCodes = text
      .split("\n")
      .map((line) => line.replace(/^Code:\s*/i, "").trim().toLowerCase())
      .filter(Boolean);

    return json({
      ok: validCodes.includes(guess),
      debug: `read OK, ${validCodes.length} code(s) found, match: ${validCodes.includes(guess)}`,
    });
  } catch (err) {
    return json({ ok: false, debug: `exception: ${String(err)}` });
  }
}

function json(body) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
}
