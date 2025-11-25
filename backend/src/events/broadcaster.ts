type SSEClient = {
  id: number
  res: import('express').Response
}

let nextId = 1
const clients = new Map<number, SSEClient>()

export function addClient(res: import('express').Response) {
  const id = nextId++
  const client: SSEClient = { id, res }
  clients.set(id, client)

  // set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  // send a comment to keep connection alive
  res.write(': connected\n\n')

  // when client closes, remove
  reqOnClose(res, () => {
    clients.delete(id)
  })

  return id
}

function reqOnClose(res: import('express').Response, cb: () => void) {
  const socket = (res as any).socket
  if (!socket) return
  socket.on('close', cb)
}

export function broadcast(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const [, client] of clients) {
    try {
      client.res.write(payload)
    } catch (e) {
      // ignore write errors; client will be removed on close
    }
  }
}

export function clientCount() {
  return clients.size
}
