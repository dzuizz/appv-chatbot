'use client'

import { useState, useRef } from 'react'
import { Upload, FileText } from 'lucide-react'

export default function FileUploadTest() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<string>('')
  const [ragTesting, setRagTesting] = useState(false)
  const [ragResult, setRagResult] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const testUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setTesting(true)
    setResult('')

    try {
      console.log('Testing upload for:', file.name, file.type, file.size)
      
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ Test successful: ${JSON.stringify(data, null, 2)}`)
      } else {
        setResult(`❌ Test failed: ${data.error}`)
      }
      
    } catch (error) {
      setResult(`❌ Test error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTesting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const testRAG = async () => {
    setRagTesting(true)
    setRagResult('')
    
    try {
      const response = await fetch('/api/test-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test search' })
      })
      
      const data = await response.json()
      setRagResult(`RAG Test Results:\n${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setRagResult(`RAG Test Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setRagTesting(false)
    }
  }

  return (
    <div className="p-4 border border-border rounded-lg bg-elev space-y-4">
      <h3 className="font-medium">Debug Tools</h3>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">File Upload Test</h4>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={testing}
          className="flex items-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-background disabled:opacity-50"
        >
          {testing ? <Upload className="animate-spin" size={16} /> : <FileText size={16} />}
          {testing ? 'Testing...' : 'Test Upload'}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.pdf,.docx"
          onChange={testUpload}
          className="hidden"
        />
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">RAG System Test</h4>
        <button
          onClick={testRAG}
          disabled={ragTesting}
          className="flex items-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-background disabled:opacity-50"
        >
          {ragTesting ? <Upload className="animate-spin" size={16} /> : <FileText size={16} />}
          {ragTesting ? 'Testing RAG...' : 'Test RAG Search'}
        </button>
      </div>
      
      {result && (
        <div>
          <h4 className="text-sm font-medium mb-2">Upload Test Result:</h4>
          <div className="p-3 bg-background border border-border rounded text-sm whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
            {result}
          </div>
        </div>
      )}
      
      {ragResult && (
        <div>
          <h4 className="text-sm font-medium mb-2">RAG Test Result:</h4>
          <div className="p-3 bg-background border border-border rounded text-sm whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
            {ragResult}
          </div>
        </div>
      )}
    </div>
  )
}