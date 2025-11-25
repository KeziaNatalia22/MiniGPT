import React, { useEffect, useRef, useState } from 'react'
import { sendPrompt } from './api/aiClient'
import markdownToHtml from './utils/markdown'
import RoomList from './components/RoomList'

type Message = { id: string; role: 'user' | 'ai'; text: string }
type Room = { id: string; title: string; messages: Message[] }

const STORAGE_KEY = 'mini-ai:rooms:v1'

function uid() {
  return String(Date.now()) + Math.random().toString(36).slice(2, 8)
}

export default function App() {
  const [input, setInput] = useState('')
  const [rooms, setRooms] = useState<Room[]>([])
  const [activeRoomId, setActiveRoomId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dark, setDark] = useState(false)

  const listRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // load rooms from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Room[]
        setRooms(parsed)
        setActiveRoomId(parsed[0]?.id)
        return
      }
    } catch (e) {
      console.error('Failed to load rooms', e)
    }

    // init with a default room
    const first: Room = { id: uid(), title: 'New chat', messages: [] }
    setRooms([first])
    setActiveRoomId(first.id)
  }, [])

  // persist rooms
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms))
    } catch (e) {
      console.error('Failed to persist rooms', e)
    }
  }, [rooms])

  useEffect(() => {
    // Auto-scroll to bottom smoothly when messages change
    const el = listRef.current
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      })
    }
  }, [rooms, loading, activeRoomId])

  useEffect(() => {
    document.documentElement.style.setProperty('--bg', dark ? '#0b0b0d' : '#f9f9f9')
    document.documentElement.style.setProperty('--header-bg', dark ? '#1f1f23' : '#343541')
  }, [dark])

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0]

  const upsertRoomMessages = (roomId: string, fn: (m: Message[]) => Message[]) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, messages: fn(r.messages) } : r)))
  }

  const submit = async () => {
    if (!input.trim() || loading) return
    if (!activeRoomId) return
    const text = input.trim()
    const userMsg: Message = { id: uid(), role: 'user', text }
    upsertRoomMessages(activeRoomId, (m) => [...m, userMsg])
    setInput('')
    autoResizeTextarea()
    setLoading(true)
    setError(null)

    try {
      const res = await sendPrompt(text)

      // Create an empty AI message and then type it out progressively
      const aiId = uid()
      const initialAiMsg: Message = { id: aiId, role: 'ai', text: '' }
      upsertRoomMessages(activeRoomId, (m) => [...m, initialAiMsg])

      // Typewriter effect: append characters over time
      await new Promise<void>((resolve) => {
        if (!res || res.length === 0) return resolve()
        let i = 0
        const len = res.length
        const baseDelay = 12
        const delay = Math.max(6, Math.min(40, Math.floor(baseDelay)))

        const timer = setInterval(() => {
          i++
          upsertRoomMessages(activeRoomId, (prevMsgs) =>
            prevMsgs.map((msg) => (msg.id === aiId ? { ...msg, text: res.slice(0, i) } : msg))
          )
          if (i >= len) {
            clearInterval(timer)
            resolve()
          }
        }, delay)
      })
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

  const createRoom = () => {
    const r: Room = { id: uid(), title: 'New chat', messages: [] }
    setRooms((p) => [r, ...p])
    setActiveRoomId(r.id)
  }

  const deleteRoom = (id: string) => {
    setRooms((p) => p.filter((r) => r.id !== id))
    if (activeRoomId === id) {
      const remaining = rooms.filter((r) => r.id !== id)
      setActiveRoomId(remaining[0]?.id)
    }
  }

  const renameRoom = (id: string, title: string) => {
    setRooms((p) => p.map((r) => (r.id === id ? { ...r, title } : r)))
  }

  return (
    <div className={`app-root ${dark ? 'dark' : ''}`}>
      <div className="chat-container">
        <RoomList
          rooms={rooms.map((r) => ({ id: r.id, title: r.title }))}
          activeId={activeRoomId}
          onSelect={(id) => setActiveRoomId(id)}
          onCreate={createRoom}
          onDelete={deleteRoom}
          onRename={renameRoom}
        />

        <div className="main-panel">
          <header className="chat-header">
            <button className="mode-toggle" onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode">
              {dark ? 'Light' : 'Dark'}
            </button>
            <div className="header-title">{activeRoom?.title ?? 'Chat'}</div>
            <div style={{ width: 56 }} />
          </header>

          <div className="messages" ref={listRef}>
            {(!activeRoom || activeRoom.messages.length === 0) && (
              <div className="empty">Start the conversation — ask anything.</div>
            )}

            {(activeRoom?.messages || []).map((m) => (
              <div key={m.id} className={`message-row ${m.role === 'user' ? 'user' : 'ai'}`}>
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
