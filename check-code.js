// Cloudflare Pages Function — runs on Cloudflare's servers, never in the
// visitor's browser. This is what makes the check real: the GitHub token
// and the actual code live here, in environment variables, not in any
// file that gets shipped to the site.
//
// URL: POST /api/check-code   body: { "code": "whatever the visitor typed" }
// Reply: { "ok": true } or { "ok": false }

export async function onRequestPost(context) {
  try {
    const { code } = await context.request.json();
    const guess = String(code || "").trim().toLowerCase();

    const token = context.env.GITHUB_TOKEN;      // set in Cloudflare Pages settings
    const owner = context.env.DEVCODES_OWNER;    // your GitHub username
    const repo = "DevCodes";
    const path = "Code.txt";

    if (!token || !owner) {
      // Env vars aren't set up yet — fail closed, not open.
      return json({ ok: false });
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
      // Wrong token, wrong repo/path, or GitHub hiccup — fail closed.
      return json({ ok: false });
    }

    const text = await ghRes.text();

    // Code.txt looks like: "Code: your-code-here"
    // Supports one code per line if you add more later.
    const validCodes = text
      .split("\n")
      .map((line) => line.replace(/^Code:\s*/i, "").trim().toLowerCase())
      .filter(Boolean);

    return json({ ok: validCodes.includes(guess) });
  } catch (err) {
    return json({ ok: false });
  }
}

function json(body) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
}
