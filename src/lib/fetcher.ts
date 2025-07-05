// lib/fetcher.ts
export async function fetchWithToken(url: string) {
  const token = localStorage.getItem("token")
  const res = await fetch(url, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Error ${res.status}`)
  }
  return res.json()
}
