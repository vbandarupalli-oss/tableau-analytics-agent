import React, { useState } from 'react'
import CitationBadge from './CitationBadge'
import { useAgent } from '../../hooks/useAgent'

export default function NudgeCard({ data, citations, tier }) {
  const [dismissed, setDismissed] = useState(false)
  const { sendMessage } = useAgent()

  if (dismissed) return null

  const message = data?.message || data?.text || ''
  const source  = data?.source  || 'ai'
  const action  = data?.action  || ''

  return (
    <div className="bg-amber-l border border-amber/30 border-l-4 border-l-amber rounded-xl px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <span className="text-amber mt-0.5">👁</span>
          <div>
            <p className="text-xs font-semibold text-text-l uppercase tracking-wider mb-1">One more thing worth your attention</p>
            <p className="text-sm text-text-m leading-relaxed">{message}</p>
          </div>
        </div>
        <CitationBadge source={source} />
      </div>
      <div className="flex gap-2 mt-3">
        {action && (
          <button
            onClick={() => sendMessage(action)}
            aria-label="Follow up on this nudge"
            className="text-xs bg-amber text-white rounded-lg px-3 py-1.5 font-medium hover:bg-amber/90 transition-colors"
          >
            Pull this up →
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss this nudge"
          className="text-xs text-text-m border border-border rounded-lg px-3 py-1.5 hover:border-amber/50 transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  )
}
