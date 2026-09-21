// Client-side Dev gate for M.O.A - no backend, no login service.
// Ordinary visitors never get past this. It is NOT real security - see
// dev-emails.js for why - but it does exactly what was asked for: a button
// that checks the email you type and only lets recognized devs through.

import { DEV_EMAILS } from "./dev-emails.js";

const FLAG = "moaDevEmail";

const clean = (email) => String(email || "").trim().toLowerCase();
const isDev = (email) => DEV_EMAILS.map(clean).includes(clean(email));

function rememberedEmail() {
  try { return localStorage.getItem(FLAG) || ""; } catch { return ""; }
}

function remember(email) {
  try { localStorage.setItem(FLAG, clean(email)); } catch {}
}

export function forget() {
  try { localStorage.removeItem(FLAG); } catch {}
}

// Used by the "Dev" link on the public site.
export function promptDevAndGo() {
  if (isDev(rememberedEmail())) {
    window.location.href = "./dev.html";
    return;
  }
  const email = window.prompt("Developer email:");
  if (email === null) return; // they hit cancel
  if (isDev(email)) {
    remember(email);
    window.location.href = "./dev.html";
  } else {
    window.alert("That email isn't on the developer list.");
  }
}

// Used at the top of dev.html. Returns true if the page should render.
export function guardDevPage() {
  if (isDev(rememberedEmail())) return true;

  const email = window.prompt("Developer email:");
  if (email !== null && isDev(email)) {
    remember(email);
    return true;
  }
  window.location.href = "./index.html";
  return false;
}
