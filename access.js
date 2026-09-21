// Client-side Dev gate for M.O.A.
// The actual code now lives server-side (see functions/api/check-code.js
// and the private DevCodes repo) - this file just asks that endpoint
// "is this code right?" and never sees the real answer itself.

const FLAG = "moaDevCode";

async function checkCode(code) {
  const clean = String(code || "").trim().toLowerCase();
  if (!clean) return false;
  try {
    const res = await fetch("/api/check-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: clean }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.ok;
  } catch {
    return false;
  }
}

function rememberedCode() {
  try { return localStorage.getItem(FLAG) || ""; } catch { return ""; }
}

function remember(code) {
  try { localStorage.setItem(FLAG, String(code || "").trim().toLowerCase()); } catch {}
}

export function forget() {
  try { localStorage.removeItem(FLAG); } catch {}
}

// Used by the "Dev" link on the public site.
export async function promptDevAndGo() {
  if (await checkCode(rememberedCode())) {
    window.location.href = "./dev.html";
    return;
  }
  const code = window.prompt("Developer access code:");
  if (code === null) return; // they hit cancel
  if (await checkCode(code)) {
    remember(code);
    window.location.href = "./dev.html";
  } else {
    window.alert("That code isn't recognized.");
  }
}

// Used at the top of dev.html. Returns true if the page should render.
export async function guardDevPage() {
  if (await checkCode(rememberedCode())) return true;

  const code = window.prompt("Developer access code:");
  if (code !== null && (await checkCode(code))) {
    remember(code);
    return true;
  }
  window.location.href = "./index.html";
  return false;
}
