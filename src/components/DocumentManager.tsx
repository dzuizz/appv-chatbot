'use client'

import { useState, useEffect } from 'react'
import { X, FileText, Trash2, RefreshCw } from 'lucide-react'

interface DocumentManagerProps {
  onClose: () => void
}

interface DocumentStats {
  documents: string[]
  stats: {
    totalChunks: number
    totalDocuments: number
    totalWords: number
  }
}

export default function DocumentManager({ onClose }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<DocumentStats>({ documents: [], stats: { totalChunks: 0, totalDocuments: 0, totalWords: 0 } })
  const [loading, setLoading] = useState(true)

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/upload')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    fetchDocuments()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-md mx-4 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Document Library</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-1 rounded-md hover:bg-elev transition-colors"
              aria-label="Refresh documents"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-elev transition-colors"
              aria-label="Close document manager"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-elev rounded-lg">
              <div className="text-lg font-semibold">{documents.stats.totalDocuments}</div>
              <div className="text-xs text-muted">Documents</div>
            </div>
            <div className="text-center p-3 bg-elev rounded-lg">
              <div className="text-lg font-semibold">{documents.stats.totalChunks}</div>
              <div className="text-xs text-muted">Chunks</div>
            </div>
            <div className="text-center p-3 bg-elev rounded-lg">
              <div className="text-lg font-semibold">{documents.stats.totalWords.toLocaleString()}</div>
              <div className="text-xs text-muted">Words</div>
            </div>
          </div>

          {/* Documents List */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Uploaded Documents</h3>
            {loading ? (
              <div className="text-center py-8 text-muted">Loading documents...</div>
            ) : documents.documents.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p>No documents uploaded yet</p>
                <p className="text-xs mt-1">Upload documents to start asking questions</p>
              </div>
            ) : (
              documents.documents.map((filename, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-elev rounded-lg">
                  <FileText size={16} className="text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{filename}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {documents.documents.length > 0 && (
            <div className="text-xs text-muted bg-elev rounded-lg p-3">
              <strong>💡 Tip:</strong> Ask specific questions about your uploaded documents. 
              The AI will search through your content and provide answers with source citations.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}