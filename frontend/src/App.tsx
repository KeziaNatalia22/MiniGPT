import React, { useEffect, useRef, useState } from 'react'
import { sendPrompt } from './api/aiClient'
import roomsApi, { Message as ApiMessage } from './api/roomsClient'
import markdownToHtml from './utils/markdown'
import RoomList from './components/RoomList'

type Message = { id: string | number; role: 'user' | 'ai'; text: string; createdAt?: string }
type Room = { id: string | number; title: string }

function uid() {
  return String(Date.now()) + Math.random().toString(36).slice(2, 8)
}

export default function App() {
  const [input, setInput] = useState('')
  const [rooms, setRooms] = useState<Room[]>([])
  const [activeRoomId, setActiveRoomId] = useState<string | number | undefined>(undefined)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dark, setDark] = useState(false)

  const listRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    document.documentElement.style.setProperty('--bg', dark ? '#0b0b0d' : '#f9f9f9')
    document.documentElement.style.setProperty('--header-bg', dark ? '#1f1f23' : '#343541')
  }, [dark])

  // load rooms from backend
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const rs = await roomsApi.listRooms()
        if (!mounted) return
        if (rs.length === 0) {
          const newr = await roomsApi.createRoom('New chat Front 1')
          setRooms([newr])
          setActiveRoomId(newr.id)
        } else {
          setRooms(rs)
          setActiveRoomId(rs[0].id)
        }
      } catch (e: any) {
        console.error('Failed to load rooms', e)
        setError('Failed to load rooms')
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // (no SSE) -- real-time update removed; frontend will rely on API polling or manual refresh

  // load messages whenever active room changes
  useEffect(() => {
    if (!activeRoomId) return
    let mounted = true
    setMessages([])
    ;(async () => {
      try {
        const msgs = (await roomsApi.getMessages(activeRoomId)) as ApiMessage[]
        if (!mounted) return
        setMessages(msgs.map((m) => ({ id: m.id, role: m.role, text: m.text, createdAt: m.createdAt })))
      } catch (e: any) {
        console.error('Failed to load messages', e)
        // If the room was removed server-side, remove it locally and pick another active room
        if (e && typeof e.status === 'number' && e.status === 404) {
          setRooms((prev) => prev.filter((r) => String(r.id) !== String(activeRoomId)))
          const remaining = rooms.filter((r) => String(r.id) !== String(activeRoomId))
          setActiveRoomId(remaining[0]?.id)
          setError(null)
        } else {
          setError('Failed to load messages')
        }
      }
    })()
    return () => { mounted = false }
  }, [activeRoomId])

  useEffect(() => {
    // Auto-scroll to bottom smoothly when messages change
    const el = listRef.current
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      })
    }
  }, [messages, loading])

  const createRoom = async () => {
    try {
      const r = await roomsApi.createRoom('New chat')
      setRooms((p) => [r, ...p])
      setActiveRoomId(r.id)
    } catch (e: any) {
      console.error('createRoom error', e)
      setError('Failed to create room')
    }
  }

  const deleteRoom = async (id: string | number) => {
    try {
      await roomsApi.deleteRoom(id)
      // After deletion, fetch fresh rooms from server to keep UI in sync
      try {
        const rs = await roomsApi.listRooms()
        setRooms(rs)
        if (String(activeRoomId) === String(id)) {
          setActiveRoomId(rs[0]?.id)
        }
      } catch (err) {
        // fallback to local removal if list fetch fails
        setRooms((p) => p.filter((r) => r.id !== id))
        if (String(activeRoomId) === String(id)) {
          setActiveRoomId(rooms.find((r) => String(r.id) !== String(id))?.id)
        }
      }
    } catch (e: any) {
      console.error('deleteRoom error', e)
      setError('Failed to delete room')
    }
  }

  const renameRoom = async (id: string | number, title: string) => {
    try {
      const r = await roomsApi.renameRoom(id, title)
      setRooms((p) => p.map((x) => (String(x.id) === String(id) ? r : x)))
    } catch (e: any) {
      console.error('renameRoom error', e)
      setError('Failed to rename room')
    }
  }

  const submit = async () => {
    if (!input.trim() || loading) return
    if (!activeRoomId) return
    const text = input.trim()
    const userMsg: Message = { id: uid(), role: 'user', text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    autoResizeTextarea()
    setLoading(true)
    setError(null)

    try {
      const res = await sendPrompt(text, activeRoomId)

      // Create an empty AI message and then type it out progressively
      const aiId = uid()
      const initialAiMsg: Message = { id: aiId, role: 'ai', text: '' }
      setMessages((m) => [...m, initialAiMsg])

      // Typewriter effect: append characters over time
      await new Promise<void>((resolve) => {
        if (!res || res.length === 0) return resolve()
        let i = 0
        const len = res.length
        const baseDelay = 12
        const delay = Math.max(6, Math.min(40, Math.floor(baseDelay)))

        const timer = setInterval(() => {
          i++
          setMessages((prevMsgs) => prevMsgs.map((msg) => (msg.id === aiId ? { ...msg, text: res.slice(0, i) } : msg)))
          if (i >= len) {
            clearInterval(timer)
            resolve()
          }
        }, delay)
      })

      // Optionally refresh messages from server to ensure persisted data
      try {
        const msgs = (await roomsApi.getMessages(activeRoomId)) as ApiMessage[]
        setMessages(msgs.map((m) => ({ id: m.id, role: m.role, text: m.text, createdAt: m.createdAt })))
      } catch (e) {
        // ignore refresh errors
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const autoResizeTextarea = () => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const max = 200
    ta.style.height = Math.min(ta.scrollHeight, max) + 'px'
  }

  useEffect(() => { autoResizeTextarea() }, [input])

  return (
    <div className={`app-root ${dark ? 'dark' : ''}`}>
      <div className="chat-container">
        <RoomList
          rooms={rooms.map((r) => ({ id: String(r.id), title: r.title }))}
          activeId={String(activeRoomId ?? '')}
          onSelect={(id) => setActiveRoomId(id)}
          onCreate={createRoom}
          onDelete={(id) => deleteRoom(id)}
          onRename={(id, title) => renameRoom(id, title)}
        />

        <div className="main-panel">
          <header className="chat-header">
            <button className="mode-toggle" onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode">
              {dark ? 'Light' : 'Dark'}
            </button>
            <div className="header-title">{rooms.find((r) => String(r.id) === String(activeRoomId))?.title ?? 'Chat'}</div>
            <div style={{ width: 56 }} />
          </header>

          <div className="messages" ref={listRef}>
            {messages.length === 0 && (
              <div className="empty">Start the conversation — ask anything.</div>
            )}

            {messages.map((m) => (
              <div key={String(m.id)} className={`message-row ${m.role === 'user' ? 'user' : 'ai'}`}>
                <div className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
                  {m.role === 'ai' ? (
                    <div
                      className="bubble-text"
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(m.text) }}
                    />
                  ) : (
                    <div className="bubble-text">{m.text}</div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-row ai">
                <div className="bubble bubble-ai typing">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="composer">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Shift+Enter for newline)"
              rows={1}
              className="composer-input"
            />
            <button className="send-btn" onClick={submit} disabled={loading} aria-disabled={loading}>
              {loading ? 'Sending…' : 'Kirim'}
            </button>
          </div>

          {error && <div className="error">{error}</div>}
        </div>
      </div>
    </div>
  )
}

