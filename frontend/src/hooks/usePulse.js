import { useEffect, useCallback, useRef } from 'react'
import { tableauAPI } from '../api/client'
import useStore from '../store'

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function usePulse() {
  const { pulseMetrics, pulseLoading, pulseError, setPulseMetrics, setPulseLoading, setPulseError } = useStore()
  const timerRef = useRef(null)

  const fetchMetrics = useCallback(async () => {
    setPulseLoading(true)
    setPulseError(null)
    try {
      const resp = await tableauAPI.getPulseMetrics()
      const raw = resp.data
      // Normalize various response shapes
      const list = raw?.metrics || raw?.metric_list?.metrics || raw?.data || []
      setPulseMetrics(Array.isArray(list) ? list : [])
    } catch (err) {
      setPulseError(err.response?.data?.detail || err.message || 'Could not reach Tableau Pulse')
    } finally {
      setPulseLoading(false)
    }
  }, [setPulseLoading, setPulseError, setPulseMetrics])

  useEffect(() => {
    fetchMetrics()
    timerRef.current = setInterval(fetchMetrics, REFRESH_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [fetchMetrics])

  return { pulseMetrics, pulseLoading, pulseError, refetch: fetchMetrics }
}
