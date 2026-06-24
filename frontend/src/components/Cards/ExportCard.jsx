import React from 'react'
import CitationBadge from './CitationBadge'
import { downloadBlob } from '../../utils/download'

const TYPE_ICONS = { png: '🖼️', pdf: '📄', csv: '📊', xlsx: '📗' }
const TYPE_MIME  = { png: 'image/png', pdf: 'application/pdf', csv: 'text/csv', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }

export default function ExportCard({ data, citations, tier }) {
  const format   = data?.format || data?.args?.format || 'png'
  const name     = data?.name || data?.label || `export.${format}`
  const content  = data?.content  // base64 or raw bytes (csv)

  function handleDownload() {
    if (!content) return
    downloadBlob(content, name, TYPE_MIME[format] || 'application/octet-stream')
  }

  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3">
      <p className="text-xs font-semibold text-text-l uppercase tracking-wider mb-2">
        Ready to share — your {name} is exported
      </p>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{TYPE_ICONS[format] || '📎'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text truncate">{name}</p>
          <p className="text-xs text-text-l">{format.toUpperCase()} file</p>
        </div>
        <CitationBadge source="export_view" />
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleDownload}
          disabled={!content}
          aria-label="Download file"
          className="flex-1 text-xs bg-blue text-white rounded-lg py-2 font-medium hover:bg-blue/90 transition-colors disabled:opacity-40"
        >
          Download this {format.toUpperCase()}
        </button>
        <button
          aria-label="Share to Slack"
          className="text-xs border border-border rounded-lg px-3 py-2 text-text-m hover:border-blue hover:text-blue transition-colors"
        >
          Share to Slack
        </button>
      </div>
    </div>
  )
}
