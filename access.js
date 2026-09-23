import { DEV_CODE_1, DEV_CODE_2 } from "./dev-codes.js";

const FLAG = "moaDevPassed";

const clean = (code) => String(code || "").trim().toLowerCase();
const matches = (input, expected) => clean(input) === clean(expected);

function alreadyPassed() {
  try { return localStorage.getItem(FLAG) === "1"; } catch { return false; }
}

function remember() {
  try { localStorage.setItem(FLAG, "1"); } catch {}
}

export function forget() {
  try { localStorage.removeItem(FLAG); } catch {}
}

// Runs the two prompts in order. Returns true only if both are correct.
function runTwoStepCheck() {
  const first = window.prompt("Developer access code (1 of 2):");
  if (first === null) return false; // cancelled
  if (!matches(first, DEV_CODE_1)) {
    window.alert("First code isn't recognized.");
    return false;
  }

  const second = window.prompt("Developer access code (2 of 2):");
  if (second === null) return false; // cancelled
  if (!matches(second, DEV_CODE_2)) {
    window.alert("Second code isn't recognized.");
    return false;
  }

  return true;
}

// Used by the "Dev" link on the public site.
export function promptDevAndGo() {
  if (alreadyPassed()) {
    window.location.href = "./dev.html";
    return;
  }
  if (runTwoStepCheck()) {
    remember();
    window.location.href = "./dev.html";
  }
}

// Used at the top of dev.html. Returns true if the page should render.
export function guardDevPage() {
  if (alreadyPassed()) return true;

  if (runTwoStepCheck()) {
    remember();
    return true;
  }
  window.location.href = "./index.html";
  return false;
}
