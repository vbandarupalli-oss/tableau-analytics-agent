import React, { useState, useRef } from 'react'
import { useAgent } from '../../hooks/useAgent'

const CHIPS = [
  { icon: '📊', label: 'Analyze',   query: 'What is my most important dashboard telling me right now?' },
  { icon: '🔍', label: 'Find',      query: 'What content do I have access to?' },
  { icon: '💬', label: 'Share',     query: 'Help me share my latest insight with my team' },
  { icon: '🗂',  label: 'Slides',   query: 'Help me build a deck from my key dashboards' },
  { icon: '⚡', label: 'Pulse',     query: 'Show me all my Pulse metrics' },
  { icon: '🔎', label: 'Query data',query: 'What datasources do I have available to query?' },
]

export default function InputBar() {
  const { sendMessage, isTyping } = useAgent()
  const [text, setText]           = useState('')
  const textareaRef               = useRef(null)

  function submit() {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return
    sendMessage(trimmed)
    setText('')
    textareaRef.current?.focus()
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-border bg-surface px-4 pt-2 pb-3 shrink-0">
      {/* Capability chips */}
      <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-none">
        {CHIPS.map(c => (
          <button
            key={c.label}
            onClick={() => sendMessage(c.query)}
            disabled={isTyping}
            aria-label={c.label}
            className="flex items-center gap-1 whitespace-nowrap bg-bg border border-border rounded-full px-2.5 py-1 text-xs text-text-m hover:border-blue hover:text-blue hover:bg-blue-l transition-colors disabled:opacity-40"
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about your data…"
          rows={1}
          aria-label="Message input"
          className="flex-1 border border-border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue-m bg-bg leading-normal"
          style={{ maxHeight: '120px', overflowY: 'auto' }}
          onInput={e => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
        />
        <button
          onClick={submit}
          disabled={!text.trim() || isTyping}
          aria-label="Send message"
          className="w-10 h-10 rounded-xl bg-blue flex items-center justify-center text-white hover:bg-blue/90 transition-colors disabled:opacity-40 shrink-0"
        >
          <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
