import React, { useState } from 'react'
import useStore from '../../store'
import { useAgent } from '../../hooks/useAgent'
import { greeting } from '../../utils/download'
import PulseDashboard from './PulseDashboard'
import CapabilityGrid from './CapabilityGrid'

const ROLE_CONTEXT = {
  default:    'Here\'s what\'s happening with your data today.',
  Analyst:    'Your metrics are loaded and ready — let\'s dig in.',
  Executive:  'Here\'s your business at a glance.',
  Engineer:   'Datasources and pipelines are available for querying.',
}

export default function HomeScreen() {
  const { user } = useStore()
  const { sendMessage } = useAgent()
  const [search, setSearch] = useState('')

  const name    = user?.name || 'there'
  const role    = user?.role || 'default'
  const context = ROLE_CONTEXT[role] || ROLE_CONTEXT.default

  function handleSearch(e) {
    e.preventDefault()
    if (search.trim()) {
      sendMessage(search.trim())
      setSearch('')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-semibold text-text">
            Good {greeting()}, {name}
          </h1>
          <p className="text-text-m mt-1 text-sm">{context}</p>
        </div>

        {/* Pulse dashboard — primary content */}
        <PulseDashboard />

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-[600px]">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-l" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ask anything about your data…"
              aria-label="Ask the analytics agent"
              className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-surface focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue-m text-sm shadow-sm"
            />
            {search && (
              <button
                type="submit"
                aria-label="Send question"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-blue text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-blue/90 transition-colors"
              >
                Ask →
              </button>
            )}
          </div>
        </form>

        {/* Capabilities */}
        <div>
          <p className="text-xs font-semibold text-text-l uppercase tracking-wider mb-3">What can I help with?</p>
          <CapabilityGrid />
        </div>
      </div>
    </div>
  )
}
