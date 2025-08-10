import { generateEmbedding } from './gemini'

export interface DocumentChunk {
  id: string
  content: string
  embedding: number[]
  metadata: {
    filename: string
    fileType: string
    chunkIndex: number
    wordCount: number
    createdAt: Date
  }
}

export class InMemoryVectorStore {
  private chunks: DocumentChunk[] = []

  async addDocument(
    content: string, 
    metadata: { filename: string; fileType: string }
  ): Promise<void> {
    console.log(`=== ADDING DOCUMENT TO VECTOR STORE ===`)
    console.log(`Document: ${metadata.filename} (${metadata.fileType})`)
    console.log(`Content length: ${content.length} characters`)
    
    const textChunks = this.chunkText(content)
    console.log(`Split into ${textChunks.length} chunks`)
    
    let successfulChunks = 0
    let failedChunks = 0
    
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i]
      if (chunk.trim().length === 0) {
        console.log(`Skipping empty chunk ${i}`)
        continue
      }

      try {
        console.log(`Processing chunk ${i + 1}/${textChunks.length} (${chunk.length} chars)`)
        const embedding = await generateEmbedding(chunk)
        
        const documentChunk: DocumentChunk = {
          id: `${metadata.filename}-${i}-${Date.now()}`,
          content: chunk,
          embedding,
          metadata: {
            ...metadata,
            chunkIndex: i,
            wordCount: chunk.split(/\s+/).length,
            createdAt: new Date()
          }
        }
        
        this.chunks.push(documentChunk)
        successfulChunks++
        console.log(`✅ Chunk ${i} processed successfully`)
      } catch (error) {
        console.error(`❌ Error processing chunk ${i}:`, error)
        failedChunks++
      }
    }
    
    console.log(`=== DOCUMENT PROCESSING COMPLETE ===`)
    console.log(`✅ Successfully processed: ${successfulChunks} chunks`)
    console.log(`❌ Failed: ${failedChunks} chunks`)
    console.log(`📊 Total chunks in store: ${this.chunks.length}`)
    console.log(`📚 Total documents in store: ${this.getDocuments().length}`)
  }

  async searchSimilar(query: string, topK: number = 5): Promise<DocumentChunk[]> {
    console.log(`=== SEARCHING SIMILAR CHUNKS ===`)
    console.log(`Query: "${query}"`)
    console.log(`Available chunks: ${this.chunks.length}`)
    console.log(`Requesting top ${topK} results`)
    
    if (this.chunks.length === 0) {
      console.log(`❌ No chunks available for search`)
      return []
    }

    try {
      console.log(`Generating embedding for query...`)
      const queryEmbedding = await generateEmbedding(query)
      console.log(`Query embedding generated: ${queryEmbedding.length} dimensions`)
      
      const similarities = this.chunks.map((chunk, index) => {
        const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding)
        console.log(`Chunk ${index} (${chunk.metadata.filename}): similarity = ${similarity.toFixed(4)}`)
        return {
          chunk,
          similarity
        }
      })

      const results = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK)
        .map(item => item.chunk)
      
      console.log(`=== SEARCH RESULTS ===`)
      console.log(`Found ${results.length} similar chunks:`)
      results.forEach((chunk, index) => {
        const similarity = similarities.find(s => s.chunk.id === chunk.id)?.similarity
        console.log(`${index + 1}. ${chunk.metadata.filename} (chunk ${chunk.metadata.chunkIndex}) - similarity: ${similarity?.toFixed(4)}`)
        console.log(`   Preview: "${chunk.content.slice(0, 100)}..."`)
      })
      
      return results
    } catch (error) {
      console.error('Error searching similar chunks:', error)
      return []
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  private chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    if (text.length <= chunkSize) {
      return [text]
    }

    const chunks: string[] = []
    let start = 0

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length)
      let chunk = text.slice(start, end)

      // Try to break at sentence boundary
      if (end < text.length) {
        const lastPeriod = chunk.lastIndexOf('. ')
        const lastNewline = chunk.lastIndexOf('\n')
        const breakPoint = Math.max(lastPeriod, lastNewline)
        
        if (breakPoint > start + chunkSize * 0.7) {
          chunk = text.slice(start, breakPoint + 1)
          start = breakPoint + 1 - overlap
        } else {
          start = end - overlap
        }
      } else {
        start = end
      }

      chunks.push(chunk.trim())
    }

    return chunks.filter(chunk => chunk.length > 0)
  }

  getDocuments(): string[] {
    const filenames = new Set(this.chunks.map(chunk => chunk.metadata.filename))
    return Array.from(filenames)
  }

  removeDocument(filename: string): void {
    this.chunks = this.chunks.filter(chunk => chunk.metadata.filename !== filename)
  }

  clear(): void {
    this.chunks = []
  }

  getStats() {
    return {
      totalChunks: this.chunks.length,
      totalDocuments: this.getDocuments().length,
      totalWords: this.chunks.reduce((sum, chunk) => sum + chunk.metadata.wordCount, 0)
    }
  }
}

// Global vector store instance
export const vectorStore = new InMemoryVectorStore()