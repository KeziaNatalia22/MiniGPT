export async function sendPrompt(text: string, roomId?: string | number): Promise<string> {
  const body: any = { text }
  if (roomId) body.roomId = roomId

  const resp = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}))
    throw new Error(body?.error || `API error: ${resp.status}`)
  }

  const data = await resp.json()
  return data.text
}
