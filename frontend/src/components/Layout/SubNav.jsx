import React from 'react'
import useStore from '../../store'

export default function SubNav() {
  const { activeView, setActiveView, setSettingsOpen } = useStore()

  return (
    <div className="h-[38px] bg-surface border-b border-border flex items-center justify-between px-4 shrink-0 z-40">
      {/* Tabs */}
      <div className="flex items-center gap-0">
        {[
          { label: 'Agent workspace', view: 'thread' },
          { label: 'Explore',         view: 'explore' },
        ].map(tab => (
          <button
            key={tab.view}
            onClick={() => setActiveView(tab.view)}
            aria-label={tab.label}
            className={`
              px-4 h-[38px] text-sm font-medium border-b-2 transition-colors
              ${activeView === tab.view || (tab.view === 'thread' && activeView === 'home')
                ? 'border-blue text-blue'
                : 'border-transparent text-text-m hover:text-text'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-green font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green inline-block" />
          Deterministic-first
        </span>
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          className="text-text-l hover:text-text-m transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
