import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

client.interceptors.request.use(config => {
  const sessionId = localStorage.getItem('session_id')
  if (sessionId) config.headers['X-Session-ID'] = sessionId
  return config
})

client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('session_id')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export const agentAPI = {
  chat: (message, conversationId, history = []) =>
    client.post('/agent/chat', { message, conversation_id: conversationId, history }),
  stream: (message, conversationId, history = []) =>
    client.post('/agent/chat/stream', { message, conversation_id: conversationId, history }),
}

export const tableauAPI = {
  getPulseMetrics:    ()     => client.get('/tableau/pulse/metrics'),
  getPulseInsights:   (id)   => client.post('/tableau/pulse/insights', { metric_id: id }),
  getWorkbooks:       ()     => client.get('/tableau/workbooks'),
  getWorkbookViews:   (id)   => client.get(`/tableau/workbooks/${id}/views`),
  getViewData:        (id)   => client.get(`/tableau/views/${id}/data`),
  getDatasources:     ()     => client.get('/tableau/datasources'),
  queryDatasource:    (body) => client.post('/tableau/datasources/query', body),
  metadataSearch:     (q)    => client.get('/tableau/metadata/search', { params: { term: q } }),
  metadataQuery:      (gql)  => client.post('/tableau/metadata/query', { gql }),
  hyperStatus:        ()     => client.get('/tableau/hyper/status'),
  hyperQuery:         (body) => client.post('/tableau/hyper/query', body),
}

export const exportAPI = {
  image: (viewId, res = 'high') =>
    client.get(`/export/views/${viewId}/image`, { params: { resolution: res }, responseType: 'blob' }),
  pdf: (viewId) =>
    client.get(`/export/views/${viewId}/pdf`, { responseType: 'blob' }),
  csv: (viewId) =>
    client.get(`/export/views/${viewId}/csv`, { responseType: 'blob' }),
  workbookPdf: (wbId) =>
    client.get(`/export/workbooks/${wbId}/pdf`, { responseType: 'blob' }),
}

export const authAPI = {
  signIn:  ()     => client.post('/auth/signin'),
  signOut: ()     => client.post('/auth/signout'),
  status:  ()     => client.get('/auth/status'),
  health:  ()     => client.get('/health'),
}

export default client
