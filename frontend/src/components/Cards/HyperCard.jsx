import React from 'react'
import CitationBadge from './CitationBadge'

export default function HyperCard({ data, citations, tier }) {
  const columns   = data?.columns || []
  const rows      = data?.rows    || []
  const path      = data?.args?.hyper_path || data?.hyper_path || ''
  const available = data?.hyper_available !== false

  if (!available) {
    return (
      <div className="bg-surface border border-amber/20 rounded-xl px-4 py-3 bg-amber-l">
        <p className="text-sm font-medium text-amber">Hyper API not available</p>
        <p className="text-xs text-text-m mt-1">
          Uncomment <code className="bg-bg px-1 rounded">tableauhyperapi</code> in{' '}
          <code className="bg-bg px-1 rounded">requirements.txt</code> and restart the backend.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-text-l uppercase tracking-wider">Hyper extract query result</p>
          {path && <p className="text-xs text-text-m mt-0.5 truncate max-w-xs">{path}</p>}
        </div>
        <CitationBadge source="hyper" entity_name={path} />
      </div>

      {columns.length > 0 && rows.length > 0 ? (
        <div className="overflow-auto" style={{ maxHeight: '260px' }}>
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-bg z-10">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="text-left px-3 py-2 font-semibold text-text-m border-b border-border whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-bg transition-colors">
                  {(Array.isArray(row) ? row : Object.values(row)).map((cell, ci) => (
                    <td key={ci} className="px-3 py-1.5 border-b border-border text-text whitespace-nowrap">
                      {cell === null || cell === undefined ? '—' : String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-4 py-5 text-center text-sm text-text-m">No rows returned</div>
      )}

      <div className="px-4 py-2 border-t border-border">
        <p className="text-xs text-text-l">{rows.length} rows</p>
      </div>
    </div>
  )
}
