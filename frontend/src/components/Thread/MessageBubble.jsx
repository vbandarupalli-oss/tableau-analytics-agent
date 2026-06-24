import React from 'react'
import CitationBadge from '../Cards/CitationBadge'

const TIER_LABELS = {
  1: { label: 'Deterministic',  color: 'text-green',  dot: 'bg-green'  },
  2: { label: 'AI + Data',      color: 'text-blue',   dot: 'bg-blue'   },
  3: { label: 'AI Suggestion',  color: 'text-text-l', dot: 'bg-text-l' },
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-blue flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-white text-xs font-bold">T</span>
      </div>
      <div className="bg-surface border border-border rounded-[2px_14px_14px_14px] px-4 py-3">
        <p className="text-xs text-text-l mb-1.5">Thinking…</p>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-text-l inline-block animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function TypingBubble() {
  return <TypingIndicator />
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const tier   = message.tier ? TIER_LABELS[message.tier] : null

  if (isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div
          className="bg-blue text-white px-4 py-2.5 max-w-[380px] text-sm leading-relaxed"
          style={{ borderRadius: '14px 14px 2px 14px' }}
        >
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-blue flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-white text-xs font-bold">T</span>
      </div>
      <div
        className={`
          bg-surface border max-w-[540px] px-4 py-3 text-sm leading-relaxed relative
          ${message.error ? 'border-red/30 bg-red-l' : 'border-border'}
        `}
        style={{ borderRadius: '2px 14px 14px 14px' }}
      >
        {/* Content — preserve newlines */}
        <div className="text-text whitespace-pre-wrap">{message.content}</div>

        {/* Citations row */}
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.citations.map((c, i) => (
              <CitationBadge key={i} source={c.tool || 'ai'} entity_name={c.label || c.tool} />
            ))}
          </div>
        )}

        {/* Tier badge */}
        {tier && (
          <div className="flex items-center gap-1 mt-2 justify-end">
            <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
            <span className={`text-[10px] font-medium ${tier.color}`}>
              Tier {message.tier} · {tier.label}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
