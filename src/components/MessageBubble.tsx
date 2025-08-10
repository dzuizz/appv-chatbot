'use client'

import { User, Bot, Copy, RefreshCw } from 'lucide-react'
import { Message } from '../types'
import { useState } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

interface MessageBubbleProps { message: Message }

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(message.content); setCopied(true); setTimeout(() => setCopied(false), 1200) } catch { }
  }

  const isUser = message.role === 'user'

  return (
    <div className="group">
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full border border-border flex items-center justify-center ${isUser ? 'bg-background' : 'bg-elev'}`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        <div className={`min-w-0 max-w-full w-full`}>
          <div
            className={
              isUser
                ? 'rounded-xl border border-border px-4 py-3'
                : 'rounded-xl border border-border px-4 py-3 bg-elev'
            }
          >
            <div className="text-sm">
              {isUser ? (
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>
              ) : (
                <MarkdownRenderer content={message.content} />
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
              <time>{new Date(message.timestamp).toLocaleTimeString()}</time>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto inline-flex items-center gap-1">
                <button onClick={copy} className="px-2 py-1 rounded-md border border-border hover:bg-background">
                  <Copy size={12} /> {copied ? 'Copied' : 'Copy'}
                </button>
                <button className="px-2 py-1 rounded-md border border-border hover:bg-background">
                  <RefreshCw size={12} /> Regenerate
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
