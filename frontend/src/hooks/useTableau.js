import { useState, useCallback } from 'react'
import { tableauAPI } from '../api/client'

export function useTableau() {
  const [workbooks, setWorkbooks]   = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  const fetchWorkbooks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await tableauAPI.getWorkbooks()
      const list = resp.data?.workbooks?.workbook || resp.data?.workbooks || []
      setWorkbooks(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err.message || 'Failed to load workbooks')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchViewData = useCallback(async (viewId) => {
    const resp = await tableauAPI.getViewData(viewId)
    return resp.data
  }, [])

  const searchContent = useCallback(async (query) => {
    const resp = await tableauAPI.metadataSearch(query)
    return resp.data
  }, [])

  return { workbooks, loading, error, fetchWorkbooks, fetchViewData, searchContent }
}
