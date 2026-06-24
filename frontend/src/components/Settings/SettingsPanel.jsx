import React, { useState } from 'react'
import useStore from '../../store'
import ModelSelector from './ModelSelector'

export default function SettingsPanel() {
  const { settingsOpen, setSettingsOpen } = useStore()
  const [provider,  setProvider]  = useState('claude')
  const [model,     setModel]     = useState('claude-sonnet-4-6')
  const [apiKey,    setApiKey]    = useState('')
  const [mode,      setMode]      = useState('deterministic')
  const [systemPmt, setSystemPmt] = useState('')
  const [showPmt,   setShowPmt]   = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)

  if (!settingsOpen) return null

  async function handleSave() {
    setSaving(true)
    // In production this would POST to /api/auth/setup
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={() => setSettingsOpen(false)}
        aria-label="Close settings"
      />

      {/* Panel */}
      <aside className="fixed right-0 top-0 h-full w-[360px] bg-surface border-l border-border z-50 flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-text">Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            aria-label="Close settings"
            className="text-text-l hover:text-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* LLM Provider */}
          <section>
            <h3 className="text-xs font-semibold text-text-l uppercase tracking-wider mb-3">LLM Provider</h3>
            <div className="flex gap-2 mb-3">
              {['claude', 'openai', 'gemini'].map(p => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  aria-label={`Select ${p}`}
                  className={`
                    flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors
                    ${provider === p ? 'bg-blue text-white border-blue' : 'border-border text-text-m hover:border-blue'}
                  `}
                >
                  {p === 'claude' ? 'Claude' : p === 'openai' ? 'OpenAI' : 'Gemini'}
                </button>
              ))}
            </div>
            <ModelSelector provider={provider} selected={model} onChange={setModel} />
            <div className="mt-3">
              <label className="block text-xs font-medium text-text-m mb-1">
                {provider === 'claude' ? 'Anthropic' : provider === 'openai' ? 'OpenAI' : 'Google'} API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-…"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue-m"
              />
            </div>
          </section>

          {/* Intelligence Mode */}
          <section>
            <h3 className="text-xs font-semibold text-text-l uppercase tracking-wider mb-3">Intelligence Mode</h3>
            {[
              { id: 'deterministic', label: 'Deterministic-first', desc: 'Always pull real data before reasoning. Recommended — every number is sourced.' },
              { id: 'llm-first',     label: 'LLM-first',           desc: 'AI reasons then calls tools only if needed. Faster but less grounded.' },
            ].map(opt => (
              <label
                key={opt.id}
                className={`
                  flex items-start gap-3 p-3 rounded-xl border cursor-pointer mb-2 transition-colors
                  ${mode === opt.id ? 'border-blue bg-blue-l' : 'border-border hover:border-blue-m'}
                `}
              >
                <input
                  type="radio"
                  name="mode"
                  value={opt.id}
                  checked={mode === opt.id}
                  onChange={() => setMode(opt.id)}
                  className="mt-0.5 accent-blue"
                />
                <div>
                  <p className="text-sm font-medium text-text">{opt.label}</p>
                  <p className="text-xs text-text-m mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </section>

          {/* Tableau connection — read-only */}
          <section>
            <h3 className="text-xs font-semibold text-text-l uppercase tracking-wider mb-3">Tableau Connection</h3>
            <div className="bg-bg rounded-xl border border-border px-3 py-3 space-y-1">
              <p className="text-xs text-text-m">Connected via PAT · credentials stored in .env</p>
              <button
                aria-label="Reconnect to Tableau"
                className="text-xs text-blue hover:underline"
              >
                Reconnect →
              </button>
            </div>
          </section>

          {/* System prompt — collapsed */}
          <section>
            <button
              onClick={() => setShowPmt(v => !v)}
              aria-label={showPmt ? 'Collapse system prompt' : 'Expand system prompt'}
              className="flex items-center gap-2 text-xs font-semibold text-text-l uppercase tracking-wider"
            >
              <svg className={`w-3 h-3 transition-transform ${showPmt ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              System Prompt (Advanced)
            </button>
            {showPmt && (
              <textarea
                value={systemPmt}
                onChange={e => setSystemPmt(e.target.value)}
                rows={6}
                placeholder="Override the system prompt…"
                className="mt-2 w-full border border-border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue resize-none"
              />
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving}
            aria-label="Save settings"
            className="w-full bg-blue text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue/90 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save settings'}
          </button>
        </div>
      </aside>
    </>
  )
}
