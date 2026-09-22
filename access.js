// Client-side Dev gate for M.O.A - no backend, no login service.
// Checks the code right in the browser and, if it matches, sends the
// visitor to dev.html in this same tab.

import { DEV_CODES } from "./dev-codes.js";

const FLAG = "moaDevCode";

const clean = (code) => String(code || "").trim().toLowerCase();
const isDev = (code) => DEV_CODES.map(clean).includes(clean(code));

function rememberedCode() {
  try { return localStorage.getItem(FLAG) || ""; } catch { return ""; }
}

function remember(code) {
  try { localStorage.setItem(FLAG, clean(code)); } catch {}
}

export function forget() {
  try { localStorage.removeItem(FLAG); } catch {}
}

// Used by the "Dev" link on the public site.
export function promptDevAndGo() {
  if (isDev(rememberedCode())) {
    window.location.href = "./dev.html";
    return;
  }
  const code = window.prompt("Developer access code:");
  if (code === null) return; // they hit cancel
  if (isDev(code)) {
    remember(code);
    window.location.href = "./dev.html";
  } else {
    window.alert("That code isn't recognized.");
  }
}

// Used at the top of dev.html. Returns true if the page should render.
export function guardDevPage() {
  if (isDev(rememberedCode())) return true;

  const code = window.prompt("Developer access code:");
  if (code !== null && isDev(code)) {
    remember(code);
    return true;
  }
  window.location.href = "./index.html";
  return false;
}
