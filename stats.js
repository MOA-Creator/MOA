// Pulls live numbers from our own stats proxy (a tiny serverless
// function that holds the real GoatCounter token server-side, so no
// secret ever reaches the browser). Set up the proxy first, then put
// its URL below - see the step-by-step instructions for that part.
const PROXY_URL = "https://REPLACE-WITH-YOUR-NETLIFY-URL.netlify.app/.netlify/functions/stats";

export async function loadStats() {
  const res = await fetch(PROXY_URL);
  if (!res.ok) {
    throw new Error(`Stats proxy ${res.status}: ${await res.text()}`);
  }
  return res.json();
}
