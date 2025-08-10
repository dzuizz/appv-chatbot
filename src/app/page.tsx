'use client'

import { useMemo, useState } from 'react'
import { Message, Chat } from '../types'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import MessageList from '../components/MessageList'
import ChatInput from '../components/ChatInput'
import Settings from '../components/Settings'
import Help from '../components/Help'
import DocumentManager from '../components/DocumentManager'

export default function ChatbotUI() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Welcome',
      messages: [
        {
          id: '1',
          content:
            "Hi! I’m your study assistant. Upload notes or paste a question to begin.",
          role: 'assistant',
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    },
  ])

  const [currentChatId, setCurrentChatId] = useState('1')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showDocuments, setShowDocuments] = useState(false)

  const currentChat = useMemo(
    () => chats.find((c) => c.id === currentChatId),
    [chats, currentChatId]
  )

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date(),
    }

    // add user message optimistically
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, userMessage], title: chat.title === 'New Chat' || chat.title === 'Welcome' ? content.slice(0, 32) || 'New Chat' : chat.title }
          : chat
      )
    )

    setIsLoading(true)

    try {
      // Get current chat history (excluding the user message we just added)
      const currentChatHistory = currentChat?.messages || []
      
      console.log(`Sending chat request with ${currentChatHistory.length} previous messages`)
      
      // Call the real API instead of simulated response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          useRag: true,
          chatHistory: currentChatHistory.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      // Add AI response
      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat
        )
      )

      console.log('Chat API response context:', data.context)

      // Add debug info and sources if available
      const debugInfo = []
      if (data.context.hasDocuments) debugInfo.push('📚 Knowledge base available')
      if (data.context.hasConversationHistory) debugInfo.push('💬 Conversation context used')
      if (data.context.chunksUsed > 0) debugInfo.push(`🔍 ${data.context.chunksUsed} relevant chunks found`)

      if (data.context && data.context.sources && data.context.sources.length > 0) {
        const sourcesMessage: Message = {
          id: `${Date.now()}-sources`,
          content: `**Context Info:**\n${debugInfo.join('\n')}\n\n**Sources used:**\n${data.context.sources.map((source: { filename: string; chunkIndex: number }, index: number) => 
            `${index + 1}. ${source.filename} (section ${source.chunkIndex + 1})`
          ).join('\n')}`,
          role: 'assistant',
          timestamp: new Date(),
        }

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, sourcesMessage] }
              : chat
          )
        )
      } else if (debugInfo.length > 0) {
        // Show debug info even if no sources were used
        const debugMessage: Message = {
          id: `${Date.now()}-debug`,
          content: `**Context Info:**\n${debugInfo.join('\n')}\n\n*No specific document sources were used for this response.*`,
          role: 'assistant',
          timestamp: new Date(),
        }

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, debugMessage] }
              : chat
          )
        )
      }

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    const newChat: Chat = {
      id: `${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    }
    setChats((prev) => [newChat, ...prev])
    setCurrentChatId(newChat.id)
  }

  const handleChatSelect = (chatId: string) => setCurrentChatId(chatId)
  const handleToggleSidebar = () => setSidebarOpen((s) => !s)
  const handleOpenSettings = () => setShowSettings(true)
  const handleCloseSettings = () => setShowSettings(false)
  const handleOpenHelp = () => setShowHelp(true)
  const handleCloseHelp = () => setShowHelp(false)
  const handleOpenDocuments = () => setShowDocuments(true)
  const handleCloseDocuments = () => setShowDocuments(false)

  return (
    <div className="flex h-dvh bg-background text-foreground">
      <Sidebar
        isOpen={sidebarOpen}
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onOpenSettings={handleOpenSettings}
        onOpenHelp={handleOpenHelp}
        onOpenDocuments={handleOpenDocuments}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          currentChat={currentChat}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
            <MessageList messages={currentChat?.messages || []} isLoading={isLoading} />
          </div>
        </main>

        <div className="border-t border-border bg-elev">
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-3">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            <p className="text-xs text-muted mt-2 text-center">
              Answers may be imperfect. Verify important details.
            </p>
          </div>
        </div>
      </div>

      {showSettings && <Settings onClose={handleCloseSettings} />}
      {showHelp && <Help onClose={handleCloseHelp} />}
      {showDocuments && <DocumentManager onClose={handleCloseDocuments} />}
    </div>
  )
}
