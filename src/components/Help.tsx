'use client'

import { X, MessageCircle, Upload, FileText, Settings as SettingsIcon, Keyboard } from 'lucide-react'

interface HelpProps {
  onClose: () => void
}

export default function Help({ onClose }: HelpProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Help & Guide</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-elev transition-colors"
            aria-label="Close help"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={18} className="text-primary" />
              <h3 className="font-medium">Getting Started</h3>
            </div>
            <div className="text-sm text-muted space-y-2 ml-6">
              <p>Welcome to your Study Assistant! This AI-powered chatbot helps you with your studies by:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Answering questions about your uploaded notes</li>
                <li>Providing explanations and summaries</li>
                <li>Helping with research and study planning</li>
                <li>Offering study tips and techniques</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Upload size={18} className="text-primary" />
              <h3 className="font-medium">Uploading Notes</h3>
            </div>
            <div className="text-sm text-muted space-y-2 ml-6">
              <p>To get the most out of your Study Assistant:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Upload your study materials, notes, or documents</li>
                <li>Supported formats: PDF, TXT, DOCX, MD</li>
                <li>Ask specific questions about the content</li>
                <li>Request summaries or explanations of key concepts</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} className="text-primary" />
              <h3 className="font-medium">Managing Conversations</h3>
            </div>
            <div className="text-sm text-muted space-y-2 ml-6">
              <p>Organize your study sessions effectively:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Create new chats for different subjects or topics</li>
                <li>Rename conversations for easy organization</li>
                <li>Export chat history in various formats</li>
                <li>Search through previous conversations</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Keyboard size={18} className="text-primary" />
              <h3 className="font-medium">Keyboard Shortcuts</h3>
            </div>
            <div className="text-sm text-muted ml-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>New chat</span>
                    <code className="px-1 py-0.5 bg-elev rounded text-xs">Ctrl+N</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Send message</span>
                    <code className="px-1 py-0.5 bg-elev rounded text-xs">Enter</code>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Toggle sidebar</span>
                    <code className="px-1 py-0.5 bg-elev rounded text-xs">Ctrl+B</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Focus input</span>
                    <code className="px-1 py-0.5 bg-elev rounded text-xs">/</code>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <SettingsIcon size={18} className="text-primary" />
              <h3 className="font-medium">Tips for Better Results</h3>
            </div>
            <div className="text-sm text-muted space-y-2 ml-6">
              <ul className="list-disc list-inside space-y-1">
                <li>Be specific in your questions for more accurate answers</li>
                <li>Upload relevant context documents before asking questions</li>
                <li>Break complex topics into smaller, focused questions</li>
                <li>Use follow-up questions to dive deeper into topics</li>
                <li>Verify important information from multiple sources</li>
              </ul>
            </div>
          </section>

          <section className="bg-elev rounded-lg p-4">
            <h3 className="font-medium mb-2 text-sm">Need More Help?</h3>
            <p className="text-xs text-muted">
              Remember that AI responses may contain errors. Always verify important information 
              and use this tool as a study aid, not a replacement for critical thinking and learning.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}