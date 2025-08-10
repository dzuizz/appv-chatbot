'use client'

import { Plus, Settings, HelpCircle, FileText } from 'lucide-react'
import { Chat } from '../types'

interface SidebarProps {
  isOpen: boolean
  chats: Chat[]
  currentChatId: string
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
  onOpenSettings: () => void
  onOpenHelp: () => void
  onOpenDocuments: () => void
}

export default function Sidebar({ isOpen, chats, currentChatId, onChatSelect, onNewChat, onOpenSettings, onOpenHelp, onOpenDocuments }: SidebarProps) {
  return (
    <aside className={`${isOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-border bg-background`}>
      <div className="h-full flex flex-col">
        <div className="p-3 border-b border-border">
          <button
            onClick={onNewChat}
            className="w-full inline-flex items-center justify-center gap-2 text-sm px-3 py-2 rounded-md border border-border hover:bg-elev"
          >
            <Plus size={16} /> New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm truncate border ${currentChatId === chat.id ? 'bg-elev border-border' : 'border-transparent hover:border-border'}`}
              title={chat.title}
            >
              <div className="font-medium truncate">{chat.title}</div>
              <div className="text-[11px] text-muted">{chat.messages.length} messages</div>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-border space-y-2">
          <button
            onClick={onOpenDocuments}
            className="w-full inline-flex items-center justify-center gap-2 text-xs px-2.5 py-2 rounded-md border border-border hover:bg-elev"
          >
            <FileText size={14} /> Documents
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center justify-center gap-2 text-xs px-2.5 py-2 rounded-md border border-border hover:bg-elev"
            >
              <Settings size={14} /> Settings
            </button>
            <button
              onClick={onOpenHelp}
              className="inline-flex items-center justify-center gap-2 text-xs px-2.5 py-2 rounded-md border border-border hover:bg-elev"
            >
              <HelpCircle size={14} /> Help
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
