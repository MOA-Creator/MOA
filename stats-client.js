// Client-side: calls the Netlify Function at netlify/functions/stats.js.
// The GoatCounter token stays on the server; this just fetches the
// already-computed numbers.

export async function loadStats() {
  const res = await fetch("/.netlify/functions/stats");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Stats request failed (${res.status})`);
  }

  return data;
}
