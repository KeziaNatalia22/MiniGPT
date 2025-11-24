import React, { useEffect, useRef, useState } from 'react'
import { sendPrompt } from './api/aiClient'

type Message = { id: string; role: 'user' | 'ai'; text: string }

export default function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dark, setDark] = useState(false)

  const listRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    // Auto-scroll to bottom smoothly when messages change
    const el = listRef.current
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      })
    }
  }, [messages, loading])

  useEffect(() => {
    document.documentElement.style.setProperty('--bg', dark ? '#0b0b0d' : '#f9f9f9')
    document.documentElement.style.setProperty('--header-bg', dark ? '#1f1f23' : '#343541')
  }, [dark])

  const submit = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    const userMsg: Message = { id: String(Date.now()), role: 'user', text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    autoResizeTextarea()
    setLoading(true)
    setError(null)

    try {
      const res = await sendPrompt(text)
      const aiMsg: Message = { id: String(Date.now() + 1), role: 'ai', text: res }
      setMessages((m) => [...m, aiMsg])
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
        <header className="chat-header">
          <button className="mode-toggle" onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode">
            {dark ? 'Light' : 'Dark'}
          </button>
          <div className="header-title">ChatGPT</div>
          <div style={{ width: 56 }} />
        </header>

        <div className="messages" ref={listRef}>
          {messages.length === 0 && (
            <div className="empty">Start the conversation — ask anything.</div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`message-row ${m.role === 'user' ? 'user' : 'ai'}`}>
              <div className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
                <div className="bubble-text">{m.text}</div>
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
  )
}
