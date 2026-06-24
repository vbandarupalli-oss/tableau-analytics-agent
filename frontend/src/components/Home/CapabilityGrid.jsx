import React from 'react'
import { useAgent } from '../../hooks/useAgent'

const CAPABILITIES = [
  { icon: '📊', label: 'Analyze my dashboard', query: 'Show me what my most important dashboard is telling me right now' },
  { icon: '🔍', label: 'Find content',          query: 'What dashboards and data do I have access to?' },
  { icon: '💬', label: 'Share & collaborate',   query: 'Help me share my latest insight with my team' },
  { icon: '🗂',  label: 'Create slides',         query: 'Help me build a deck from my key dashboards' },
  { icon: '⚡', label: 'Pulse metrics',          query: 'Show me all my Pulse metrics and what needs attention' },
  { icon: '🔎', label: 'Query data',             query: 'I want to query my data directly — what datasources do I have?' },
]

export default function CapabilityGrid() {
  const { sendMessage } = useAgent()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {CAPABILITIES.map(cap => (
        <button
          key={cap.label}
          onClick={() => sendMessage(cap.query)}
          aria-label={cap.label}
          className="flex items-center gap-2.5 bg-surface border border-border rounded-xl px-4 py-3 text-left hover:border-blue hover:bg-blue-l transition-colors group"
        >
          <span className="text-xl shrink-0">{cap.icon}</span>
          <span className="text-sm font-medium text-text group-hover:text-blue transition-colors leading-tight">{cap.label}</span>
        </button>
      ))}
    </div>
  )
}
