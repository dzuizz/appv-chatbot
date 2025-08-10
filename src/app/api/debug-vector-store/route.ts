import { NextResponse } from 'next/server'
import { vectorStore } from '@/lib/vector-store'

export async function GET() {
  try {
    const stats = vectorStore.getStats()
    const documents = vectorStore.getDocuments()
    
    console.log('Vector store debug check:', { stats, documents })
    
    return NextResponse.json({
      stats,
      documents,
      timestamp: new Date().toISOString(),
      available: stats.totalChunks > 0
    })
  } catch (error) {
    console.error('Debug vector store error:', error)
    return NextResponse.json({
      error: 'Failed to get vector store info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}