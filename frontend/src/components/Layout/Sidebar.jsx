import React, { useState } from 'react'
import useStore from '../../store'
import { useProjects } from '../../hooks/useProjects'

export default function Sidebar() {
  const { messages } = useStore()
  const { projects, openProject, saveCurrentThread } = useProjects()
  const [saveName, setSaveName] = useState('')
  const [saving, setSaving] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    if (!saveName.trim()) return
    saveCurrentThread(saveName.trim())
    setSaveName('')
    setSaving(false)
  }

  return (
    <aside className="w-[210px] bg-surface border-r border-border flex flex-col shrink-0 overflow-hidden">
      {/* Projects header */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-text-m uppercase tracking-wider">Projects</span>
        <button
          onClick={() => setSaving(v => !v)}
          aria-label="Save current thread as project"
          className="w-5 h-5 rounded flex items-center justify-center text-text-l hover:text-blue hover:bg-blue-l transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {saving && (
        <form onSubmit={handleSave} className="px-3 pb-2 flex gap-1">
          <input
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            placeholder="Project name…"
            autoFocus
            className="flex-1 text-xs border border-border rounded px-2 py-1 focus:outline-none focus:border-blue"
          />
          <button type="submit" className="text-xs bg-blue text-white rounded px-2 py-1">Save</button>
        </form>
      )}

      {/* Project list */}
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <p className="px-3 py-3 text-xs text-text-l leading-relaxed">
            Your analytical workstreams will live here. Start a conversation and save it as a project
            when you're working on something specific — like QBR prep or a deal review.
          </p>
        ) : (
          projects.map(p => (
            <button
              key={p.id}
              onClick={() => openProject(p)}
              aria-label={`Open project: ${p.name}`}
              className="w-full text-left px-3 py-2.5 hover:bg-bg transition-colors group"
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-text-l text-sm">📁</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text truncate">{p.name}</p>
                  <p className="text-xs text-text-l">{p.messageCount} messages</p>
                </div>
              </div>
            </button>
          ))
        )}

        {/* Divider */}
        {projects.length > 0 && (
          <div className="mx-3 my-2 border-t border-border" />
        )}

        {/* Recent sessions */}
        <div className="px-3 py-1">
          <span className="text-xs font-semibold text-text-l uppercase tracking-wider">Recent</span>
        </div>
        {messages.length === 0 ? (
          <p className="px-3 py-2 text-xs text-text-l leading-relaxed">
            Nothing here yet — but once you start exploring, I'll remember what you looked at so we
            can pick up where you left off.
          </p>
        ) : (
          <button
            onClick={() => useStore.getState().setActiveView('thread')}
            className="w-full text-left px-3 py-2.5 hover:bg-bg transition-colors"
          >
            <p className="text-xs text-text-m truncate">
              {messages[messages.length - 1]?.content?.slice(0, 55)}…
            </p>
          </button>
        )}
      </div>
    </aside>
  )
}
