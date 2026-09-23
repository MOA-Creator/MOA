export async function loadStats() {
  const res = await fetch("/api/stats");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Stats request failed (${res.status})`);
  }

  return data;
}
