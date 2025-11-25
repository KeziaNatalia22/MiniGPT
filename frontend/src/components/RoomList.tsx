import React, { useState } from 'react'

type Room = { id: string; title: string }

export default function RoomList({
  rooms,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
}: {
  rooms: Room[]
  activeId?: string
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onRename: (id: string, title: string) => void
}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [tempTitle, setTempTitle] = useState('')

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Chats</div>
        <button className="new-room" onClick={onCreate} title="New chat">+</button>
      </div>

      <div className="room-list">
        {rooms.map((r) => (
          <div
            key={r.id}
            className={`room-item ${r.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(r.id)}
          >
            {editing === r.id ? (
              <input
                className="room-rename"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={() => {
                  setEditing(null)
                  onRename(r.id, tempTitle || r.title)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur()
                  }
                  if (e.key === 'Escape') {
                    setEditing(null)
                  }
                }}
                autoFocus
              />
            ) : (
              <>
                <div className="room-title">{r.title}</div>
                <div className="room-actions">
                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditing(r.id)
                      setTempTitle(r.title)
                    }}
                    title="Rename"
                  >
                    ✎
                  </button>
                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(r.id)
                    }}
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}
