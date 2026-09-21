// M.O.A visitor stats (public side).
// - counts page visits, unique visitors, visits that came from a search engine, and download clicks
// - only stores plain counters (no personal data, no IPs)
// - shows the hidden "Dev" link ONLY to a signed-in dev (verified by Firestore rules, not by this file)
// - a dev's own visits are not counted

import { firebaseConfig } from "./firebase-config.js";

const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
const DEV_FLAG = "moaDev";

const configured = !Object.values(firebaseConfig).some((v) => String(v).startsWith("PASTE"));

function safeGet(storage, key) {
  try { return storage.getItem(key); } catch { return null; }
}

// returns true only the first time for this key (per session or per browser)
function firstTime(storage, key) {
  try {
    if (storage.getItem(key)) return false;
    storage.setItem(key, "1");
    return true;
  } catch {
    return false; // storage blocked -> don't risk over-counting
  }
}

const SEARCH_HOST = /(^|\.)(google|bing|duckduckgo|yahoo|yandex|baidu|ecosia|startpage|qwant|naver|seznam)\./i;

function cameFromSearchEngine() {
  try {
    if (!document.referrer) return false;
    const host = new URL(document.referrer).hostname;
    return SEARCH_HOST.test(host) || host === "search.brave.com";
  } catch {
    return false;
  }
}

const utcDay = () => new Date().toISOString().slice(0, 10);

let appPromise = null;
function getApp() {
  if (!appPromise) {
    appPromise = import(FB + "firebase-app.js").then((m) => m.initializeApp(firebaseConfig));
  }
  return appPromise;
}

async function bump(fields) {
  try {
    const app = await getApp();
    const { getFirestore, doc, writeBatch, increment } = await import(FB + "firebase-firestore.js");
    const db = getFirestore(app);
    const inc = {};
    fields.forEach((f) => { inc[f] = increment(1); });
    const batch = writeBatch(db);
    batch.set(doc(db, "stats", "totals"), inc, { merge: true });
    batch.set(doc(db, "daily", utcDay()), inc, { merge: true });
    await batch.commit();
  } catch (err) {
    // stats must never break the site
    console.debug("stats skipped", err && err.code);
  }
}

// Is the current browser signed in as a real dev? (Firestore rules decide, not the flag.)
async function verifyDev() {
  try {
    const app = await getApp();
    const { getAuth, onAuthStateChanged } = await import(FB + "firebase-auth.js");
    const { getFirestore, doc, getDoc } = await import(FB + "firebase-firestore.js");
    const auth = getAuth(app);
    const user = await new Promise((resolve) => {
      const off = onAuthStateChanged(auth, (u) => { off(); resolve(u); });
    });
    if (!user) return false;
    await getDoc(doc(getFirestore(app), "stats", "totals")); // throws permission-denied for non-devs
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!configured) return;

  // Someone who has signed in as a dev on this browser before
  if (safeGet(localStorage, DEV_FLAG) === "1") {
    if (await verifyDev()) {
      document.querySelectorAll("[data-dev-only]").forEach((el) => { el.hidden = false; });
      return; // don't count dev visits
    }
    try { localStorage.removeItem(DEV_FLAG); } catch {}
  }

  const fields = [];
  if (firstTime(sessionStorage, "moa_view")) {
    fields.push("views");
    if (cameFromSearchEngine()) fields.push("searchVisits");
  }
  if (firstTime(localStorage, "moa_unique")) fields.push("uniques");
  if (fields.length) bump(fields);

  document.addEventListener("click", (e) => {
    const link = e.target.closest && e.target.closest("a[download]");
    if (link) bump(["downloads"]);
  });
}

main();
