// TEMPORARY debug version — reports *why* a check failed (missing env
// vars, GitHub API status, etc.) without ever exposing the token or the
// actual code. Swap back to the plain version once this is working.

export async function onRequestPost(context) {
  try {
    const { code } = await context.request.json();
    const guess = String(code || "").trim().toLowerCase();

    const token = context.env.GITHUB_TOKEN;
    const owner = context.env.DEVCODES_OWNER;
    const repo = "DevCodes";
    const path = "Code.txt";

    if (!token || !owner) {
      return json({ ok: false, debug: "missing GITHUB_TOKEN or DEVCODES_OWNER env var" });
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
      return json({ ok: false, debug: `GitHub API returned status ${ghRes.status}` });
    }

    const text = await ghRes.text();

    const validCodes = text
      .split("\n")
      .map((line) => line.replace(/^Code:\s*/i, "").trim().toLowerCase())
      .filter(Boolean);

    return json({
      ok: validCodes.includes(guess),
      debug: `read file OK, found ${validCodes.length} code(s), match: ${validCodes.includes(guess)}`,
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
