import React from 'react'

const MODELS = {
  claude: [
    { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', desc: 'Best balance of speed and capability — recommended' },
    { id: 'claude-opus-4-8',   label: 'Claude Opus 4.8',   desc: 'Highest capability, slower' },
    { id: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5',  desc: 'Fastest, best for simple queries' },
  ],
  openai: [
    { id: 'gpt-4o',     label: 'GPT-4o',     desc: 'OpenAI flagship model' },
    { id: 'gpt-4-turbo',label: 'GPT-4 Turbo',desc: 'High capability' },
  ],
  gemini: [
    { id: 'gemini-1.5-pro',   label: 'Gemini 1.5 Pro',   desc: 'Google flagship' },
    { id: 'gemini-1.5-flash',  label: 'Gemini 1.5 Flash', desc: 'Faster, lighter' },
  ],
}

export default function ModelSelector({ provider, selected, onChange }) {
  const models = MODELS[provider] || []

  return (
    <div className="space-y-1.5">
      {models.map(m => (
        <label
          key={m.id}
          className={`
            flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors
            ${selected === m.id ? 'border-blue bg-blue-l' : 'border-border hover:border-blue-m'}
          `}
        >
          <input
            type="radio"
            name="model"
            value={m.id}
            checked={selected === m.id}
            onChange={() => onChange(m.id)}
            className="mt-0.5 accent-blue"
          />
          <div>
            <p className="text-sm font-medium text-text">{m.label}</p>
            <p className="text-xs text-text-m">{m.desc}</p>
          </div>
        </label>
      ))}
    </div>
  )
}
