import React, { useState } from 'react'
import { authAPI } from '../../api/client'
import useStore from '../../store'

const STEPS = ['Tableau Connection', 'LLM Configuration', 'Ready']

export default function SetupWizard() {
  const { setSetupComplete, setUser } = useStore()
  const [step, setStep]           = useState(0)
  const [form, setForm]           = useState({
    serverUrl:  'https://us-west-2b.online.tableau.com',
    siteId:     'viksdemosite',
    patName:    '',
    patSecret:  '',
    llm:        'claude',
    apiKey:     '',
  })
  const [testing, setTesting]     = useState(false)
  const [testOk, setTestOk]       = useState(false)
  const [testError, setTestError] = useState('')

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setTestOk(false)
    setTestError('')
  }

  async function testConnection() {
    setTesting(true)
    setTestOk(false)
    setTestError('')
    try {
      await authAPI.signIn()
      setTestOk(true)
    } catch (err) {
      setTestError(err.response?.data?.detail || 'Could not connect — check your URL and PAT credentials.')
    } finally {
      setTesting(false)
    }
  }

  function finish() {
    setUser({ name: 'You', role: 'Analyst', site_name: form.siteId })
    setSetupComplete(true)
  }

  const llmLabels = { claude: 'Anthropic API Key', openai: 'OpenAI API Key', gemini: 'Google API Key' }
  const llmDesc   = {
    claude: 'Most capable for analytics reasoning. Recommended.',
    openai: 'Solid option. GPT-4 class models.',
    gemini: 'Google Gemini. Works well for data tasks.',
  }

  return (
    <div className="fixed inset-0 bg-bg flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl border border-border shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-navy px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-white font-semibold">Tableau Analytics Agent</span>
          </div>
          {/* Step progress */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 ${i <= step ? 'text-white' : 'text-white/40'}`}>
                  <div className={`
                    w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border
                    ${i < step  ? 'bg-green border-green text-white'
                    : i === step ? 'bg-blue border-blue text-white'
                    :              'border-white/30 text-white/40'}
                  `}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px ${i < step ? 'bg-green/60' : 'bg-white/20'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Step 0 — Tableau connection */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-text">Connect to Tableau</h2>
              <p className="text-sm text-text-m">Enter your Tableau Cloud credentials to get started.</p>
              {[
                { key: 'serverUrl',  label: 'Server URL',  type: 'url',      placeholder: 'https://…' },
                { key: 'siteId',     label: 'Site Name',   type: 'text',     placeholder: 'your-site' },
                { key: 'patName',    label: 'PAT Name',    type: 'text',     placeholder: 'My Token' },
                { key: 'patSecret',  label: 'PAT Secret',  type: 'password', placeholder: '••••••••' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-text-m mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue-m"
                  />
                </div>
              ))}

              {testError && (
                <div className="rounded-lg bg-red-l border border-red/20 px-3 py-2 text-sm text-red">{testError}</div>
              )}
              {testOk && (
                <div className="rounded-lg bg-green-l border border-green/20 px-3 py-2 text-sm text-green flex items-center gap-2">
                  <span>✓</span> Connected to Tableau — found your metrics
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={testConnection}
                  disabled={testing || !form.patName || !form.patSecret}
                  aria-label="Test Tableau connection"
                  className="flex-1 border border-border rounded-lg py-2 text-sm font-medium text-text-m hover:border-blue hover:text-blue transition-colors disabled:opacity-40"
                >
                  {testing ? 'Testing…' : 'Test connection'}
                </button>
                <button
                  onClick={() => setStep(1)}
                  disabled={!form.patName || !form.patSecret}
                  aria-label="Continue to LLM setup"
                  className="flex-1 bg-blue text-white rounded-lg py-2 text-sm font-medium hover:bg-blue/90 transition-colors disabled:opacity-40"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 1 — LLM */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-text">Choose your AI model</h2>
              <p className="text-sm text-text-m">The agent uses this to reason about your data and write responses.</p>
              {['claude', 'openai', 'gemini'].map(provider => (
                <label
                  key={provider}
                  className={`
                    flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors
                    ${form.llm === provider ? 'border-blue bg-blue-l' : 'border-border hover:border-blue-m'}
                  `}
                >
                  <input
                    type="radio"
                    name="llm"
                    value={provider}
                    checked={form.llm === provider}
                    onChange={() => set('llm', provider)}
                    className="mt-0.5 accent-blue"
                  />
                  <div>
                    <p className="text-sm font-medium text-text capitalize">{provider === 'claude' ? 'Claude (Anthropic)' : provider === 'openai' ? 'OpenAI' : 'Gemini (Google)'}</p>
                    <p className="text-xs text-text-m mt-0.5">{llmDesc[provider]}</p>
                  </div>
                </label>
              ))}
              <div>
                <label className="block text-xs font-medium text-text-m mb-1">{llmLabels[form.llm]}</label>
                <input
                  type="password"
                  value={form.apiKey}
                  onChange={e => set('apiKey', e.target.value)}
                  placeholder="sk-…"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue-m"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep(0)} className="flex-1 border border-border rounded-lg py-2 text-sm font-medium text-text-m hover:border-blue transition-colors">← Back</button>
                <button onClick={() => setStep(2)} disabled={!form.apiKey} className="flex-1 bg-blue text-white rounded-lg py-2 text-sm font-medium hover:bg-blue/90 transition-colors disabled:opacity-40">Continue →</button>
              </div>
            </div>
          )}

          {/* Step 2 — Ready */}
          {step === 2 && (
            <div className="text-center space-y-5 py-4">
              <div className="w-14 h-14 rounded-full bg-green-l flex items-center justify-center mx-auto">
                <span className="text-2xl">✓</span>
              </div>
              <div>
                <h2 className="font-semibold text-text text-lg">Your Analytics Agent is ready</h2>
                <p className="text-sm text-text-m mt-2 max-w-sm mx-auto">
                  Connected to Tableau. I'll pull your Pulse metrics and be ready to answer any question
                  about your data in seconds.
                </p>
              </div>
              <button
                onClick={finish}
                aria-label="Launch agent"
                className="w-full bg-blue text-white rounded-xl py-3 font-medium hover:bg-blue/90 transition-colors"
              >
                Let's go →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
