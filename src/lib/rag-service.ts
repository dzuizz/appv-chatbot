import { vectorStore, DocumentChunk } from './vector-store'
import { generateResponse } from './gemini'

export interface RAGResponse {
  answer: string
  sources: Array<{
    filename: string
    chunkIndex: number
    relevanceScore?: number
  }>
  context: string
}

export class RAGService {
  static async query(question: string, topK: number = 5): Promise<RAGResponse> {
    try {
      // Step 1: Retrieve relevant context
      const relevantChunks = await vectorStore.searchSimilar(question, topK)
      
      if (relevantChunks.length === 0) {
        // No context available, answer with general knowledge
        const answer = await generateResponse(question)
        return {
          answer,
          sources: [],
          context: ''
        }
      }

      // Step 2: Format context for the LLM
      const context = relevantChunks
        .map((chunk, index) => {
          return `Source ${index + 1} (from ${chunk.metadata.filename}):\n${chunk.content}`
        })
        .join('\n\n---\n\n')

      // Step 3: Generate augmented response
      const systemPrompt = `You are a helpful study assistant. Answer the user's question based on the provided context from their uploaded documents. 

Guidelines:
1. Use information from the context to answer the question
2. If the context doesn't contain relevant information, say so clearly
3. Cite your sources when possible (e.g., "According to [filename]...")
4. Be concise but comprehensive
5. If you need to make inferences, clearly indicate that

Context:
${context}

Question: ${question}`

      const answer = await generateResponse(systemPrompt)

      // Step 4: Format sources
      const sources = relevantChunks.map(chunk => ({
        filename: chunk.metadata.filename,
        chunkIndex: chunk.metadata.chunkIndex
      }))

      return {
        answer,
        sources,
        context
      }

    } catch (error) {
      console.error('RAG query error:', error)
      throw new Error('Failed to process query with RAG')
    }
  }

  static async addDocument(content: string, filename: string, fileType: string): Promise<void> {
    try {
      await vectorStore.addDocument(content, { filename, fileType })
    } catch (error) {
      console.error('Error adding document to RAG:', error)
      throw new Error('Failed to add document to knowledge base')
    }
  }

  static getKnowledgeBaseStats() {
    return vectorStore.getStats()
  }

  static getDocuments(): string[] {
    return vectorStore.getDocuments()
  }

  static removeDocument(filename: string): void {
    vectorStore.removeDocument(filename)
  }

  static clearKnowledgeBase(): void {
    vectorStore.clear()
  }

  static async semanticSearch(query: string, topK: number = 10): Promise<DocumentChunk[]> {
    return await vectorStore.searchSimilar(query, topK)
  }
}

// Utility function to format RAG response for display
export function formatRAGResponse(response: RAGResponse): string {
  let formatted = response.answer

  if (response.sources.length > 0) {
    formatted += '\n\n**Sources:**\n'
    response.sources.forEach((source, index) => {
      formatted += `${index + 1}. ${source.filename} (chunk ${source.chunkIndex + 1})\n`
    })
  }

  return formatted
}