'use client'

import { useState, useRef, useEffect } from 'react'
import { Paperclip, Send, X, Upload } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [uploadingFile, setUploadingFile] = useState<boolean>(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'enter') {
        e.preventDefault();
        submit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const submit = () => {
    if (!inputValue.trim() || isLoading) return
    onSendMessage(inputValue.trim())
    setInputValue('')
    if (textareaRef.current) textareaRef.current.style.height = '48px'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    el.style.height = '48px'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log(`Starting upload for file: ${file.name}, type: ${file.type}, size: ${file.size}`)
    setUploadingFile(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      // Check if response is JSON or HTML
      const contentType = response.headers.get('content-type')
      let result
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json()
      } else {
        // If we get HTML instead of JSON, it's likely a server error
        const htmlText = await response.text()
        console.error('Server returned HTML instead of JSON:', htmlText.substring(0, 500))
        throw new Error('Server error: The upload API encountered an internal error. Check console for details.')
      }

      if (!response.ok) {
        console.error('Upload failed:', result)
        throw new Error(result.error || 'Failed to upload file')
      }

      console.log('Upload successful:', result)
      onSendMessage(`📄 Uploaded "${file.name}" successfully! 
      
**Document Stats:**
- Word count: ${result.document.wordCount.toLocaleString()}
- Knowledge base now has ${result.stats.totalDocuments} documents with ${result.stats.totalChunks} chunks
      
You can now ask questions about this document!`)

    } catch (error) {
      console.error('File upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      onSendMessage(`❌ **Failed to upload "${file.name}"**

${errorMessage}

Please check that your file is a supported format (PDF, DOCX, TXT, MD) and try again.`)
    } finally {
      setUploadingFile(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="">
      {/* Suggestion chips (contextual in future) */}
      <div className="flex flex-wrap gap-2 mb-2">
        {['Summarise these notes', 'Generate 5 MCQs', 'Explain like I\'m Sec 2'].map((s) => (
          <button
            key={s}
            onClick={() => setInputValue((v) => (v ? v + '\n' + s : s))}
            className="text-xs px-2.5 py-1 border border-border rounded-full hover:bg-elev"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Ask anything… (Shift+Enter = new line)"
          className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 pr-24 leading-6 focus:outline-none focus:ring-2 ring-accent text-sm"
          rows={1}
          style={{ height: 48 }}
        />

        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <button
            type="button"
            onClick={handleFileSelect}
            disabled={uploadingFile}
            className="p-2 rounded-md border border-border hover:bg-elev disabled:opacity-50"
            aria-label="Attach files"
          >
            {uploadingFile ? <Upload size={16} className="animate-spin" /> : <Paperclip size={16} />}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!inputValue.trim() || isLoading}
            className="p-2 rounded-md bg-[rgb(var(--accent))] text-white disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,.markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,text/markdown"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      <div className="mt-2 text-[11px] text-muted">Press ⌘/Ctrl+Enter to send • Click 📎 to upload documents</div>
    </div>
  )
}
