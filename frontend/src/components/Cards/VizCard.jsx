import React, { useState } from 'react'
import CitationBadge from './CitationBadge'
import { exportAPI } from '../../api/client'
import { downloadBlob } from '../../utils/download'

export default function VizCard({ data, citations, tier }) {
  const [loadingImg, setLoadingImg] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadingCsv, setLoadingCsv] = useState(false)

  const viewId   = data?.args?.view_id || data?.view_id
  const viewName = data?.view_name || data?.label || 'View'
  const filters  = data?.filters  || []
  const serverUrl = import.meta.env.VITE_TABLEAU_SERVER_URL || ''

  async function dl(type) {
    if (!viewId) return
    if (type === 'image') {
      setLoadingImg(true)
      try {
        const r = await exportAPI.image(viewId)
        downloadBlob(r.data, `${viewName}.png`, 'image/png')
      } finally { setLoadingImg(false) }
    } else if (type === 'pdf') {
      setLoadingPdf(true)
      try {
        const r = await exportAPI.pdf(viewId)
        downloadBlob(r.data, `${viewName}.pdf`, 'application/pdf')
      } finally { setLoadingPdf(false) }
    } else {
      setLoadingCsv(true)
      try {
        const r = await exportAPI.csv(viewId)
        downloadBlob(r.data, `${viewName}.csv`, 'text/csv')
      } finally { setLoadingCsv(false) }
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs font-semibold text-text-l uppercase tracking-wider mb-1">
          Here's where you stand on {viewName}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f, i) => (
            <span key={i} className="text-xs bg-blue-l text-blue border border-blue-m rounded-full px-2 py-0.5">{f}</span>
          ))}
          <CitationBadge source="rest" entity_name={viewName} />
        </div>
      </div>
      <div className="px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
        {viewId && serverUrl && (
          <a
            href={`${serverUrl}/#/views/${viewId}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in Tableau"
            className="text-xs text-blue hover:underline font-medium"
          >
            Open in Tableau ↗
          </a>
        )}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: loadingImg ? 'Exporting…' : 'Image',  type: 'image', loading: loadingImg },
            { label: loadingPdf ? 'Exporting…' : 'PDF',    type: 'pdf',   loading: loadingPdf },
            { label: loadingCsv ? 'Exporting…' : 'CSV',    type: 'csv',   loading: loadingCsv },
          ].map(btn => (
            <button
              key={btn.type}
              onClick={() => dl(btn.type)}
              disabled={btn.loading || !viewId}
              aria-label={`Export as ${btn.type}`}
              className="text-xs border border-border rounded-lg px-2.5 py-1 text-text-m hover:border-blue hover:text-blue transition-colors disabled:opacity-40"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
