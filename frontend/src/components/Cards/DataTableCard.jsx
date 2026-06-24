import React, { useState } from 'react'
import CitationBadge from './CitationBadge'
import { exportAPI } from '../../api/client'
import { downloadBlob } from '../../utils/download'

export default function DataTableCard({ data, citations, tier }) {
  const [downloading, setDownloading] = useState(false)

  const columns = data?.columns || []
  const rows    = data?.rows    || []
  const source  = data?.source  || data?.tool || 'vizql'
  const viewId  = data?.args?.view_id || data?.view_id

  const isHyper = source === 'hyper' || source === 'query_hyper_file'

  async function downloadCsv() {
    if (!viewId) return
    setDownloading(true)
    try {
      const resp = await exportAPI.csv(viewId)
      downloadBlob(resp.data, `view-${viewId}.csv`, 'text/csv')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-text-l uppercase tracking-wider">Here's the data behind that</p>
          <p className="text-xs text-text-m mt-0.5">{rows.length} rows from <CitationBadge source={isHyper ? 'hyper' : 'vizql'} /></p>
        </div>
        <div className="flex gap-2">
          {viewId && (
            <button
              onClick={downloadCsv}
              disabled={downloading}
              aria-label="Download as CSV"
              className="text-xs text-blue border border-blue-m rounded-lg px-2.5 py-1 hover:bg-blue-l transition-colors disabled:opacity-40"
            >
              {downloading ? 'Downloading…' : 'Download as CSV'}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {columns.length > 0 && rows.length > 0 ? (
        <div className="overflow-auto" style={{ maxHeight: '280px' }}>
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-bg z-10">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="text-left px-3 py-2 font-semibold text-text-m border-b border-border whitespace-nowrap">
                    {col}
                  </th>
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
        <div className="px-4 py-6 text-center text-sm text-text-m">No data to display</div>
      )}
    </div>
  )
}
