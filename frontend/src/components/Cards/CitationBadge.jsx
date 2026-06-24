import React from 'react'

const STYLES = {
  pulse:      'bg-green-l text-green border-green/30',
  vizql:      'bg-blue-l text-blue border-blue-m',
  hyper:      'bg-purple-50 text-purple-700 border-purple-200',
  rest:       'bg-amber-l text-amber border-amber/30',
  ai:         'bg-gray-100 text-gray-600 border-gray-200',
  suggestion: 'bg-gray-200 text-gray-700 border-gray-300',
  // tool name aliases
  get_pulse_insights:  'bg-green-l text-green border-green/30',
  get_view_data:       'bg-blue-l text-blue border-blue-m',
  query_datasource:    'bg-blue-l text-blue border-blue-m',
  query_hyper_file:    'bg-purple-50 text-purple-700 border-purple-200',
  list_workbooks:      'bg-amber-l text-amber border-amber/30',
  summarize_dashboard: 'bg-amber-l text-amber border-amber/30',
  run_metadata_query:  'bg-gray-100 text-gray-600 border-gray-200',
  export_view:         'bg-gray-100 text-gray-600 border-gray-200',
}

const ICONS = {
  pulse:       '🟢',
  vizql:       '🔵',
  hyper:       '🟣',
  rest:        '🟡',
  ai:          '⚪',
  suggestion:  '🔘',
  get_pulse_insights:  '🟢',
  get_view_data:       '🔵',
  query_datasource:    '🔵',
  query_hyper_file:    '🟣',
  list_workbooks:      '🟡',
  summarize_dashboard: '🟡',
  run_metadata_query:  '⚪',
  export_view:         '⚪',
}

const LABELS = {
  pulse:       'PULSE',
  vizql:       'VIZQL',
  hyper:       'HYPER',
  rest:        'REST',
  ai:          'AI',
  suggestion:  'AI',
  get_pulse_insights:  'PULSE',
  get_view_data:       'VIZQL',
  query_datasource:    'VIZQL',
  query_hyper_file:    'HYPER',
  list_workbooks:      'REST',
  summarize_dashboard: 'REST',
  run_metadata_query:  'META',
  export_view:         'EXPORT',
}

export default function CitationBadge({ source, entity_name, query_time, tier }) {
  const key    = source || 'ai'
  const style  = STYLES[key] || STYLES.ai
  const icon   = ICONS[key]  || '⚪'
  const label  = LABELS[key] || key.toUpperCase()
  const tip    = [entity_name, query_time ? `${query_time}ms` : null].filter(Boolean).join(' · ')

  return (
    <span
      title={tip || label}
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${style}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  )
}
