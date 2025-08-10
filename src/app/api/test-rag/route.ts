import { NextRequest, NextResponse } from 'next/server'
import { vectorStore } from '@/lib/vector-store'

export async function POST(request: NextRequest) {
  console.log('=== RAG TEST ENDPOINT ===')
  
  try {
    const { query } = await request.json()
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    console.log(`Testing RAG with query: "${query}"`)
    
    // Get current vector store stats
    const stats = vectorStore.getStats()
    console.log('Vector store stats:', stats)
    
    // Test search
    const results = await vectorStore.searchSimilar(query, 3)
    console.log(`Search returned ${results.length} results`)
    
    return NextResponse.json({
      success: true,
      query,
      stats,
      results: results.map(chunk => ({
        filename: chunk.metadata.filename,
        chunkIndex: chunk.metadata.chunkIndex,
        wordCount: chunk.metadata.wordCount,
        contentPreview: chunk.content.slice(0, 200),
        embeddingDimensions: chunk.embedding.length
      })),
      totalResults: results.length
    })
    
  } catch (error) {
    console.error('RAG test error:', error)
    return NextResponse.json({
      error: `RAG test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error instanceof Error ? error.stack : 'No details'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const stats = vectorStore.getStats()
    const documents = vectorStore.getDocuments()
    
    return NextResponse.json({
      stats,
      documents,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('RAG info error:', error)
    return NextResponse.json({
      error: 'Failed to get RAG info'
    }, { status: 500 })
  }
}