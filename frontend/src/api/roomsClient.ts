export type Room = { id: number | string; title: string }
export type Message = { id: number | string; role: 'user' | 'ai'; text: string; createdAt?: string }

async function fetchJson(url: string, opts?: RequestInit) {
  const resp = await fetch(url, opts)
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}))
    throw new Error(body?.error || `HTTP ${resp.status}`)
  }
  return resp.json()
}

export function listRooms(): Promise<Room[]> {
  return fetchJson('/api/rooms')
}

export function createRoom(title?: string): Promise<Room> {
  return fetchJson('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) })
}

export function renameRoom(id: string | number, title: string): Promise<Room> {
  return fetchJson(`/api/rooms/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) })
}

export function deleteRoom(id: string | number): Promise<void> {
  return fetchJson(`/api/rooms/${id}`, { method: 'DELETE' })
}

export function getMessages(roomId: string | number, opts?: { limit?: number; offset?: number }) {
  const q = new URLSearchParams()
  if (opts?.limit) q.set('limit', String(opts.limit))
  if (opts?.offset) q.set('offset', String(opts.offset))
  const url = `/api/rooms/${roomId}/messages${q.toString() ? `?${q.toString()}` : ''}`
  return fetchJson(url) as Promise<Message[]>
}

export function postMessage(roomId: string | number, role: 'user' | 'ai', text: string) {
  return fetchJson(`/api/rooms/${roomId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, text }) })
}

export default { listRooms, createRoom, renameRoom, deleteRoom, getMessages, postMessage }
