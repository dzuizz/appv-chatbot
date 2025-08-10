'use client'

import { useEffect, useRef } from 'react'
import { Message } from '../types'
import MessageBubble from './MessageBubble'
import LoadingIndicator from './LoadingIndicator'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, isLoading])

  return (
    <div className="space-y-6">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {isLoading && <LoadingIndicator />}
      <div ref={endRef} />
    </div>
  )
}
