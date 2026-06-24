import React from 'react'
import { usePulse } from '../../hooks/usePulse'
import MetricTile from './MetricTile'

function SkeletonTile() {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton h-7 w-32 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-3/4 rounded" />
    </div>
  )
}

export default function PulseDashboard() {
  const { pulseMetrics, pulseLoading, pulseError, refetch } = usePulse()

  if (pulseLoading && pulseMetrics.length === 0) {
    return (
      <div>
        <h2 className="text-sm font-semibold text-text-m uppercase tracking-wider mb-3">Pulse Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonTile key={i} />)}
        </div>
      </div>
    )
  }

  if (pulseError) {
    return (
      <div className="rounded-xl bg-red-l border border-red/20 p-5 text-center">
        <p className="text-sm text-red font-medium mb-1">Lost connection to Tableau</p>
        <p className="text-xs text-text-m mb-3">
          This usually fixes itself — give it a moment and try again.
          If it keeps happening, check that your Tableau Cloud instance is reachable.
        </p>
        <button
          onClick={refetch}
          aria-label="Retry loading Pulse metrics"
          className="text-xs font-medium text-red border border-red/30 rounded-lg px-3 py-1.5 hover:bg-red/10 transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  if (pulseMetrics.length === 0) {
    return (
      <div className="rounded-xl bg-amber-l border border-amber/20 p-5">
        <p className="text-sm font-medium text-amber mb-2">No Pulse metrics subscribed yet</p>
        <p className="text-sm text-text-m leading-relaxed">
          You don't have any Pulse metrics subscribed yet — which means you're flying a bit blind on
          your key numbers. Want me to show you what's available and set up the ones that matter for
          your role?
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-m uppercase tracking-wider">
          Pulse Metrics
          {pulseLoading && <span className="ml-2 text-xs text-text-l font-normal">Refreshing…</span>}
        </h2>
        <span className="text-xs text-text-l">{pulseMetrics.length} metrics</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {pulseMetrics.map((m, i) => (
          <MetricTile key={m.id || m.metric_id || i} metric={m} />
        ))}
      </div>
    </div>
  )
}
