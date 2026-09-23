export async function loadChangelog() {
  const res = await fetch("/api/changelog");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Changelog request failed (${res.status})`);
  }

  return data.entries;
}

export async function saveChangelog(entries, token) {
  const res = await fetch("/api/changelog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify({ entries }),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Save failed (${res.status})`);
  }

  return data;
}
