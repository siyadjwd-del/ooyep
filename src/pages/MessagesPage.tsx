import { useEffect, useRef, useState, type FormEvent } from 'react'
import { api } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { Card, Loader } from '../components/ui'
import type { Message } from '../data/types'
import { useAuth } from '../context/AuthContext'
import { initials } from '../utils/format'
import './pages.css'

export default function MessagesPage() {
  const { client } = useAuth()
  const { data, loading, error } = useAsync(() => api.getMessages(), [])
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (data) setMessages(data)
  }, [data])

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send(e: FormEvent) {
    e.preventDefault()
    const body = draft.trim()
    if (!body || sending) return
    setSending(true)
    setDraft('')
    try {
      const msg = await api.sendMessage(body)
      setMessages((m) => [...m, msg])
    } finally {
      setSending(false)
    }
  }

  if (loading) return <Loader label="Loading messages…" />
  if (error) return <Card title="Unable to load">{error}</Card>

  return (
    <div className="stack">
      <div className="page-intro">
        <div>
          <h2>Messages</h2>
          <p>
            A secure, direct line to {client?.advisorName}. Ask a question, request a call, or
            share an instruction — typically answered within one business day.
          </p>
        </div>
      </div>

      <Card title={client?.advisorName} subtitle="Your dedicated advisor · Sit Invest">
        <div className="chat">
          <div className="chat-thread" ref={threadRef}>
            {messages.map((m) => {
              const mine = m.from === 'client'
              return (
                <div key={m.id} className={`bubble-row ${mine ? 'me' : ''}`}>
                  <div className="bubble-av">{initials(m.author)}</div>
                  <div>
                    {!mine && <div className="bubble-name">{m.author}</div>}
                    <div className="bubble">
                      {m.body}
                      <span className="bubble-time">{formatTime(m.sentAt)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <form className="chat-compose" onSubmit={send}>
            <textarea
              rows={2}
              placeholder="Write a message to your advisor…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send(e)
                }
              }}
            />
            <button type="submit" className="btn btn-primary" disabled={!draft.trim() || sending}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
