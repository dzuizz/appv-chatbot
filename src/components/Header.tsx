'use client'

import { Menu, X } from 'lucide-react'
import { Chat } from '../types'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  currentChat: Chat | undefined
}

export default function Header({ sidebarOpen, onToggleSidebar, currentChat }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-elev border border-transparent hover:border-border transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <h1 className="truncate text-sm sm:text-base font-medium">
          {currentChat?.title || 'Chat'}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex px-2.5 py-1 text-xs rounded-full border border-border">
          Model: Study Assistant
        </span>
        <ThemeToggle />
      </div>
    </header>
  )
}
