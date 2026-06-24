export function downloadBlob(blob, filename, mimeType) {
  const url = URL.createObjectURL(new Blob([blob], { type: mimeType }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function formatNumber(value) {
  if (value === null || value === undefined) return '—'
  const num = parseFloat(value)
  if (isNaN(num)) return String(value)
  if (Math.abs(num) >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (Math.abs(num) >= 1_000)     return (num / 1_000).toFixed(1)     + 'K'
  return num.toLocaleString()
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
