import React from 'react'
import CitationBadge from './CitationBadge'
import { formatNumber } from '../../utils/download'

export default function MetricCard({ data, citations, tier }) {
  const name    = data?.metric_name || data?.name || 'Metric'
  const value   = data?.value ?? data?.current_value
  const change  = parseFloat(data?.change_percent ?? 0)
  const context = data?.context_sentence || ''
  const source  = data?.source || 'rest'

  const direction = change >= 0 ? 'up' : 'down'
  const pct = Math.abs(change).toFixed(1)

  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-text-l uppercase tracking-wider">
          {name} is {direction} {pct}%
        </p>
        <CitationBadge source={source} entity_name={name} />
      </div>
      {value !== undefined && (
        <p className="text-2xl font-bold text-text">{formatNumber(value)}</p>
      )}
      {context && <p className="text-xs text-text-m mt-1 leading-relaxed">{context}</p>}
    </div>
  )
}
