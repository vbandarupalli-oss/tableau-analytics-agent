import React, { useEffect, useRef } from 'react'
import useStore from '../../store'
import MessageBubble, { TypingBubble } from './MessageBubble'
import InputBar from './InputBar'
import { useAgent } from '../../hooks/useAgent'
import PulseCard    from '../Cards/PulseCard'
import InsightCard  from '../Cards/InsightCard'
import DataTableCard from '../Cards/DataTableCard'
import MetricCard   from '../Cards/MetricCard'
import VizCard      from '../Cards/VizCard'
import ExportCard   from '../Cards/ExportCard'
import HyperCard    from '../Cards/HyperCard'
import NudgeCard    from '../Cards/NudgeCard'

const CARD_MAP = {
  pulse:      PulseCard,
  insight:    InsightCard,
  data_table: DataTableCard,
  metric:     MetricCard,
  viz:        VizCard,
  export:     ExportCard,
  hyper:      HyperCard,
  nudge:      NudgeCard,
}

function renderCard(card, index) {
  const Component = CARD_MAP[card.type]
  if (!Component) return null
  return (
    <Component
      key={`${card.type}-${index}`}
      data={card.data}
      citations={card.citations}
      tier={card.tier}
    />
  )
}

export default function Thread() {
  const { messages, isTyping, currentCards } = useStore()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-blue-l flex items-center justify-center mb-4">
              <span className="text-blue text-xl font-bold">T</span>
            </div>
            <h3 className="text-text font-medium mb-1">Ready when you are</h3>
            <p className="text-text-m text-sm max-w-xs">
              Ask me anything about your Tableau data — I'll pull the numbers and tell you what they mean.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <React.Fragment key={msg.id || i}>
            <MessageBubble message={msg} />
            {/* Show cards after last assistant message */}
            {msg.role === 'assistant' && i === messages.length - 1 && currentCards.length > 0 && (
              <div className="ml-9 mb-4 space-y-2">
                {currentCards.map((card, ci) => renderCard(card, ci))}
              </div>
            )}
          </React.Fragment>
        ))}

        {isTyping && <TypingBubble />}
        <div ref={bottomRef} />
      </div>

      <InputBar />
    </div>
  )
}
