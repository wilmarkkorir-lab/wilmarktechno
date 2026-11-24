const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

let csrf = null

async function csrfHeader() {
  if (!csrf) {
    try {
      const r = await fetch(BASE + '/csrf/', { credentials: 'include' })
      if (r.ok) csrf = (await r.json()).csrfToken
    } catch { /* offline */ }
  }
  return csrf ? { 'X-CSRFToken': csrf } : {}
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (method !== 'GET') Object.assign(headers, await csrfHeader())
  const res = await fetch(BASE + path, {
    method,
    headers,
    credentials: 'include',
    body: body && JSON.stringify(body),
  })
  if (res.status === 204) return null
  let data = null
  try { data = await res.json() } catch { data = null }
  if (!res.ok) throw new Error(data?.error || data?.detail || `Request failed (${res.status})`)
  return data
}
