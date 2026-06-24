import React from 'react'
import useStore from '../../store'

export default function TopNav() {
  const { user, activeView, setActiveView } = useStore()

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const navLinks = [
    { label: 'Home',    view: 'home' },
    { label: 'Explore', view: 'explore' },
    { label: 'Agent',   view: 'thread' },
  ]

  return (
    <nav className="h-[46px] bg-navy flex items-center justify-between px-4 shrink-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-blue flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm leading-none">T</span>
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">Analytics Agent</span>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {navLinks.map(link => (
          <button
            key={link.view}
            onClick={() => setActiveView(link.view)}
            aria-label={`Go to ${link.label}`}
            className={`
              px-3 py-1 rounded text-sm font-medium transition-colors
              ${activeView === link.view
                ? 'bg-blue text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'}
            `}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button aria-label="Notifications" className="text-white/70 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <div
          aria-label={`User: ${user?.name || 'Account'}`}
          className="w-7 h-7 rounded-full bg-blue flex items-center justify-center cursor-pointer"
        >
          <span className="text-white text-xs font-semibold">{initials}</span>
        </div>
      </div>
    </nav>
  )
}
