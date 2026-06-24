import React from 'react'
import CitationBadge from './CitationBadge'

const SEVERITY_CONFIG = {
  critical: {
    headline:   'Here\'s the problem',
    border:     'border-l-red',
    bg:         'bg-red-l',
    badgeColor: 'text-red',
  },
  warning: {
    headline:   'Something needs your attention',
    border:     'border-l-amber',
    bg:         'bg-amber-l',
    badgeColor: 'text-amber',
  },
  positive: {
    headline:   'Here\'s what\'s working',
    border:     'border-l-green',
    bg:         'bg-green-l',
    badgeColor: 'text-green',
  },
  neutral: {
    headline:   'Here\'s what the data shows',
    border:     'border-l-blue',
    bg:         'bg-blue-l',
    badgeColor: 'text-blue',
  },
}

const TIER_LABELS = { 1: 'Tier 1 · Deterministic', 2: 'Tier 2 · AI + Data', 3: 'Tier 3 · AI Suggestion' }

export default function InsightCard({ data, citations, tier }) {
  const severity = data?.severity || 'neutral'
  const cfg      = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.neutral
  const finding  = data?.finding || data?.text || data?.content || ''
  const actions  = data?.actions || []

  return (
    <div className={`bg-surface border border-border border-l-4 ${cfg.border} rounded-xl overflow-hidden`}>
      <div className="px-4 pt-3 pb-2">
        <p className="text-xs font-semibold text-text-l uppercase tracking-wider">{cfg.headline}</p>
        <p className="text-sm text-text mt-1 leading-relaxed">{finding}</p>
      </div>

      {/* Citations */}
      {citations && citations.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {citations.map((c, i) => (
            <CitationBadge key={i} source={c.tool || c.source || 'ai'} entity_name={c.label} />
          ))}
        </div>
      )}

      {/* Tier + actions */}
      <div className="px-4 py-2.5 border-t border-border flex items-center justify-between flex-wrap gap-2">
        <span className="text-[10px] text-text-l font-medium">{TIER_LABELS[tier] || TIER_LABELS[2]}</span>
        <div className="flex gap-2 flex-wrap">
          {actions.map((a, i) => (
            <button
              key={i}
              aria-label={a}
              className="text-xs text-blue border border-blue-m rounded-lg px-2.5 py-1 hover:bg-blue-l transition-colors"
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
