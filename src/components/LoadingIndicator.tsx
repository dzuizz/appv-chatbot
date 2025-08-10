'use client'

import { Bot } from 'lucide-react'

export default function LoadingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full border border-border bg-elev flex items-center justify-center">
        <Bot size={16} />
      </div>
      <div className="rounded-xl border border-border px-4 py-3 bg-elev">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-current animate-bounce"></span>
          <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:120ms]"></span>
          <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:240ms]"></span>
        </div>
      </div>
    </div>
  )
}
