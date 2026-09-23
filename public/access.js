const FLAG = "moaDevPassed";

function alreadyPassed() {
  try { return localStorage.getItem(FLAG) === "1"; } catch { return false; }
}

function remember() {
  try { localStorage.setItem(FLAG, "1"); } catch {}
}

export function forget() {
  try { localStorage.removeItem(FLAG); } catch {}
}

async function verifyCodes(code1, code2) {
  try {
    const res = await fetch("/api/dev-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code1, code2 }),
    });
    const data = await res.json();
    return res.ok && data.ok === true;
  } catch {
    return false;
  }
}

async function runTwoStepCheck() {
  const first = window.prompt("Developer access code (1 of 2):");
  if (first === null) return false;

  const second = window.prompt("Developer access code (2 of 2):");
  if (second === null) return false;

  const ok = await verifyCodes(first, second);
  if (!ok) {
    window.alert("Access code not recognized.");
    return false;
  }
  return true;
}

export async function promptDevAndGo() {
  if (alreadyPassed()) {
    window.location.href = "./dev.html";
    return;
  }
  if (await runTwoStepCheck()) {
    remember();
    window.location.href = "./dev.html";
  }
}

export async function guardDevPage() {
  if (alreadyPassed()) return true;

  if (await runTwoStepCheck()) {
    remember();
    return true;
  }
  window.location.href = "./index.html";
  return false;
}
