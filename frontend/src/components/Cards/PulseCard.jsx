import React from 'react'
import CitationBadge from './CitationBadge'
import { formatNumber } from '../../utils/download'

export default function PulseCard({ data, citations, tier }) {
  const metric   = data?.metric_name || data?.label || data?.args?.metric_id || 'metric'
  const value    = data?.current_value ?? data?.value
  const change   = parseFloat(data?.change_percent ?? 0)
  const insights = data?.insights || []
  const status   = data?.status || (change > 0 ? 'good' : change < 0 ? 'critical' : 'neutral')

  const statusStyle = {
    good:     'bg-green-l border-green/20 text-green',
    critical: 'bg-red-l border-red/20 text-red',
    warning:  'bg-amber-l border-amber/20 text-amber',
    neutral:  'bg-bg border-border text-text-m',
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <p className="text-xs text-text-l font-semibold uppercase tracking-wider mb-1">Here's where {metric} stands</p>
        <div className="flex items-end gap-3">
          {value !== undefined && (
            <span className="text-3xl font-bold text-text leading-none">{formatNumber(value)}</span>
          )}
          {change !== 0 && (
            <span className={`text-sm font-medium pb-0.5 ${change >= 0 ? 'text-green' : 'text-red'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusStyle[status] || statusStyle.neutral}`}>
            {status}
          </span>
          <CitationBadge source="pulse" entity_name={metric} />
        </div>
      </div>

      {/* Insights — verbatim */}
      {insights.length > 0 && (
        <div className="px-4 py-3 space-y-2">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-2">
              <CitationBadge source="pulse" />
              <p className="text-sm text-text-m leading-relaxed">{typeof ins === 'string' ? ins : ins.text || ins.description || JSON.stringify(ins)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-border flex flex-wrap gap-2">
        {[
          'Download this metric',
          'Get notified if this changes',
          'Share to Slack',
        ].map(action => (
          <button
            key={action}
            aria-label={action}
            className="text-xs text-blue border border-blue-m bg-blue-l rounded-lg px-3 py-1.5 hover:bg-blue hover:text-white transition-colors"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  )
}
