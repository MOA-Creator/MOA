// Client-side Dev gate for M.O.A - no backend, no worker, no GitHub call.
// Checks an email + code pair right in the browser and, if it matches,
// sends the visitor to dev.html in this same tab.

import { DEV_USERS } from "./dev-users.js";

const EMAIL_FLAG = "moaDevEmail";
const CODE_FLAG = "moaDevCode";

const clean = (value) => String(value || "").trim().toLowerCase();

function isDev(email, code) {
  const e = clean(email);
  const c = clean(code);
  return DEV_USERS.some((user) => clean(user.email) === e && clean(user.code) === c);
}

function remembered() {
  try {
    return { email: localStorage.getItem(EMAIL_FLAG) || "", code: localStorage.getItem(CODE_FLAG) || "" };
  } catch {
    return { email: "", code: "" };
  }
}

function remember(email, code) {
  try {
    localStorage.setItem(EMAIL_FLAG, clean(email));
    localStorage.setItem(CODE_FLAG, clean(code));
  } catch {}
}

export function forget() {
  try {
    localStorage.removeItem(EMAIL_FLAG);
    localStorage.removeItem(CODE_FLAG);
  } catch {}
}

function askForCredentials() {
  const email = window.prompt("Developer email:");
  if (email === null) return null;
  const code = window.prompt("Developer access code:");
  if (code === null) return null;
  return { email, code };
}

// Used by the "Dev" link on the public site.
export function promptDevAndGo() {
  const saved = remembered();
  if (isDev(saved.email, saved.code)) {
    window.location.href = "./dev.html";
    return;
  }
  const creds = askForCredentials();
  if (!creds) return; // they hit cancel
  if (isDev(creds.email, creds.code)) {
    remember(creds.email, creds.code);
    window.location.href = "./dev.html";
  } else {
    window.alert("That email/code combination isn't recognized.");
  }
}

// Used at the top of dev.html. Returns true if the page should render.
export function guardDevPage() {
  const saved = remembered();
  if (isDev(saved.email, saved.code)) return true;

  const creds = askForCredentials();
  if (creds && isDev(creds.email, creds.code)) {
    remember(creds.email, creds.code);
    return true;
  }
  window.location.href = "./index.html";
  return false;
}
