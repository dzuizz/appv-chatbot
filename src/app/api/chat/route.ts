import { NextRequest, NextResponse } from 'next/server'
import { generateResponse } from '@/lib/gemini'
import { vectorStore } from '@/lib/vector-store'

export async function POST(request: NextRequest) {
  try {
    const { message, useRag = true, chatHistory = [] } = await request.json()

    console.log(`Chat request: message="${message}", useRag=${useRag}, historyLength=${chatHistory.length}`)

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    let documentContext = ''
    let relevantChunks: Array<{ content: string; metadata: { filename: string; chunkIndex: number } }> = []

    // First, check if we have any documents in the knowledge base
    const stats = vectorStore.getStats()
    console.log(`Vector store stats:`, stats)

    if (useRag && stats.totalChunks > 0) {
      console.log(`Searching for relevant chunks for: "${message}"`)
      
      // Retrieve relevant context using RAG
      relevantChunks = await vectorStore.searchSimilar(message, 5)
      console.log(`Found ${relevantChunks.length} relevant chunks`)
      
      if (relevantChunks.length > 0) {
        documentContext = relevantChunks
          .map((chunk, index) => `[Source ${index + 1} - ${chunk.metadata.filename}] ${chunk.content}`)
          .join('\n\n')
        console.log(`Document context length: ${documentContext.length} characters`)
      }
    } else {
      console.log(`RAG disabled or no documents available (useRag: ${useRag}, chunks: ${stats.totalChunks})`)
    }

    // Build conversation history for context
    let conversationContext = ''
    if (chatHistory && chatHistory.length > 0) {
      // Include last 10 messages for context
      const recentHistory = chatHistory.slice(-10)
      conversationContext = recentHistory
        .map((msg: { role: string; content: string }) => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
        .join('\n')
      console.log(`Conversation context includes ${recentHistory.length} previous messages`)
    }

    // Combine contexts
    let fullContext = ''
    if (documentContext && conversationContext) {
      fullContext = `Previous conversation:\n${conversationContext}\n\nRelevant documents:\n${documentContext}`
    } else if (documentContext) {
      fullContext = `Relevant documents:\n${documentContext}`
    } else if (conversationContext) {
      fullContext = `Previous conversation:\n${conversationContext}`
    }

    // Generate response using Gemini with full context
    const response = await generateResponse(message, fullContext)

    console.log(`Generating response with context length: ${fullContext.length}`)
    
    return NextResponse.json({
      response,
      context: {
        chunksUsed: relevantChunks.length,
        sources: relevantChunks.map(chunk => ({
          filename: chunk.metadata.filename,
          chunkIndex: chunk.metadata.chunkIndex
        })),
        hasDocuments: stats.totalChunks > 0,
        hasConversationHistory: conversationContext.length > 0
      }
    })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}

// Stream endpoint for real-time responses
export async function PUT(request: NextRequest) {
  try {
    const { message, useRag = true } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    let context = ''
    let relevantChunks: Array<{ content: string; metadata: { filename: string; chunkIndex: number } }> = []

    if (useRag && vectorStore.getStats().totalChunks > 0) {
      relevantChunks = await vectorStore.searchSimilar(message, 5)
      context = relevantChunks
        .map((chunk, index) => `[${index + 1}] ${chunk.content}`)
        .join('\n\n')
    }

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await generateResponse(message, context)
          
          // Simulate streaming by sending chunks
          const words = response.split(' ')
          for (let i = 0; i < words.length; i++) {
            const chunk = words.slice(0, i + 1).join(' ')
            
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                content: chunk,
                done: false,
                sources: relevantChunks.map(chunk => ({
                  filename: chunk.metadata.filename,
                  chunkIndex: chunk.metadata.chunkIndex
                }))
              })}\n\n`)
            )
            
            // Add delay for streaming effect
            await new Promise(resolve => setTimeout(resolve, 50))
          }
          
          // Send final message
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              content: response,
              done: true,
              sources: relevantChunks.map(chunk => ({
                filename: chunk.metadata.filename,
                chunkIndex: chunk.metadata.chunkIndex
              }))
            })}\n\n`)
          )
          
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Streaming chat error:', error)
    return NextResponse.json(
      { error: 'Failed to generate streaming response' },
      { status: 500 }
    )
  }
}