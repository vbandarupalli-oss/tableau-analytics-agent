import { useCallback } from 'react'
import { agentAPI } from '../api/client'
import useStore from '../store'

export function useAgent() {
  const {
    messages, conversationId, isTyping,
    addMessage, setTyping, setCards,
    setConversationId, setActiveView,
  } = useStore()

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isTyping) return

    const userMsg = { role: 'user', content: text, id: Date.now() }
    addMessage(userMsg)
    setTyping(true)
    setActiveView('thread')

    const history = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const resp = await agentAPI.chat(text, conversationId, history)
      const data = resp.data

      if (data.conversation_id) setConversationId(data.conversation_id)

      const agentMsg = {
        role:      'assistant',
        content:   data.response,
        id:        Date.now() + 1,
        citations: data.citations || [],
        tools:     data.tool_calls_made || [],
        tier:      inferTier(data.tool_calls_made),
      }
      addMessage(agentMsg)

      // Build cards from citations + response
      const cards = buildCards(data)
      setCards(cards)
    } catch (err) {
      const errMsg = {
        role:    'assistant',
        content: "Lost connection to the backend. This usually fixes itself — give it a moment and try again.",
        id:      Date.now() + 1,
        error:   true,
        tier:    null,
      }
      addMessage(errMsg)
    } finally {
      setTyping(false)
    }
  }, [messages, conversationId, isTyping, addMessage, setTyping, setCards, setConversationId, setActiveView])

  return { sendMessage, isTyping, messages }
}

function inferTier(tools) {
  if (!tools || tools.length === 0) return 3
  const dataSources = ['get_view_data', 'query_datasource', 'get_pulse_insights', 'query_hyper_file']
  if (tools.some(t => dataSources.includes(t))) return 1
  return 2
}

function buildCards(data) {
  const cards = []

  if (!data.citations || data.citations.length === 0) return cards

  data.citations.forEach(c => {
    const tool = c.tool
    if (tool === 'get_pulse_insights') {
      cards.push({ type: 'pulse', data: c, citations: [c], tier: 1 })
    } else if (tool === 'get_view_data' || tool === 'query_datasource') {
      cards.push({ type: 'data_table', data: c, citations: [c], tier: 1 })
    } else if (tool === 'export_view') {
      cards.push({ type: 'export', data: c, citations: [c], tier: 1 })
    } else if (tool === 'query_hyper_file') {
      cards.push({ type: 'hyper', data: c, citations: [c], tier: 1 })
    } else if (tool === 'list_workbooks' || tool === 'summarize_dashboard') {
      cards.push({ type: 'viz', data: c, citations: [c], tier: 2 })
    }
  })

  return cards
}
