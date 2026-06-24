import React from 'react'
import { formatNumber } from '../../utils/download'
import { useAgent } from '../../hooks/useAgent'
import CitationBadge from '../Cards/CitationBadge'

export default function MetricTile({ metric }) {
  const { sendMessage } = useAgent()

  const name       = metric?.name || metric?.metric_name || 'Metric'
  const value      = metric?.current_value ?? metric?.value ?? metric?.ban_value
  const change     = parseFloat(metric?.change_percent ?? metric?.percent_change ?? 0)
  const direction  = change >= 0 ? 'up' : 'down'
  const insight    = metric?.insight_text || metric?.description || ''
  const status     = metric?.status || (change > 5 ? 'good' : change < -5 ? 'critical' : 'warning')

  const statusColors = {
    good:     'bg-green',
    warning:  'bg-amber',
    critical: 'bg-red',
  }

  function askAbout() {
    const fmt = formatNumber(value)
    const pct = Math.abs(change).toFixed(1)
    sendMessage(`Tell me about ${name}: current value is ${fmt}, ${pct}% ${direction}`)
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-blue-m transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-l uppercase tracking-wider">{name}</span>
        <div className={`w-2 h-2 rounded-full ${statusColors[status] || 'bg-text-l'}`} />
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-bold text-text leading-none">{formatNumber(value)}</p>
        {change !== 0 && (
          <p className={`text-sm mt-1 flex items-center gap-1 ${change >= 0 ? 'text-green' : 'text-red'}`}>
            <span>{change >= 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(change).toFixed(1)}%</span>
          </p>
        )}
      </div>

      {/* Insight */}
      {insight && (
        <p className="text-xs text-text-m italic leading-relaxed line-clamp-2">{insight}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-border">
        <CitationBadge source="pulse" entity_name={name} />
        <button
          onClick={askAbout}
          aria-label={`Ask about ${name}`}
          className="text-xs text-blue hover:underline font-medium"
        >
          Ask about this →
        </button>
      </div>
    </div>
  )
}
