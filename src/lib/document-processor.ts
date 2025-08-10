// Dynamic imports for server-side compatibility

export interface ProcessedDocument {
  content: string
  metadata: {
    filename: string
    fileType: string
    wordCount: number
    processedAt: Date
  }
}

export class DocumentProcessor {
  static async processFile(file: File): Promise<ProcessedDocument> {
    const buffer = await file.arrayBuffer()
    let content = ''
    
    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`)

    try {
      // Handle different MIME types and file extensions
      const fileExtension = file.name.toLowerCase().split('.').pop()
      const mimeType = file.type.toLowerCase()
      
      if (mimeType === 'application/pdf' || fileExtension === 'pdf') {
        content = await this.processPDF(Buffer.from(buffer))
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 mimeType === 'application/msword' || 
                 fileExtension === 'docx' || fileExtension === 'doc') {
        content = await this.processDocx(Buffer.from(buffer))
      } else if (mimeType === 'text/plain' || 
                 mimeType === 'text/markdown' || 
                 mimeType === '' || // Sometimes browsers don't set MIME type
                 fileExtension === 'txt' || 
                 fileExtension === 'md' || 
                 fileExtension === 'markdown') {
        content = await this.processText(Buffer.from(buffer))
      } else {
        throw new Error(`Unsupported file type: ${file.type} (${fileExtension})`)
      }

      return {
        content: content.trim(),
        metadata: {
          filename: file.name,
          fileType: file.type,
          wordCount: content.split(/\s+/).length,
          processedAt: new Date()
        }
      }
    } catch (error) {
      console.error('Error processing file:', error)
      throw new Error(`Failed to process file: ${file.name}`)
    }
  }

  private static async processPDF(buffer: Buffer): Promise<string> {
    try {
      console.log(`Processing PDF, buffer size: ${buffer.length}`)
      
      // Dynamically import pdf-parse
      const pdfParse = (await import('pdf-parse')).default
      
      // Try pdf-parse library
      const data = await pdfParse(buffer)
      console.log(`PDF processed successfully: ${data.numpages} pages, ${data.text.length} characters`)
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('PDF contains no extractable text content')
      }
      
      return data.text
    } catch (error) {
      console.error('PDF parsing error details:', error)
      
      // If pdf-parse fails, try a basic text extraction approach
      try {
        console.log('Attempting fallback PDF text extraction...')
        const text = buffer.toString('utf8')
        
        // Look for text content in the PDF (very basic approach)
        const textMatches = text.match(/\(([^)]+)\)/g)
        if (textMatches && textMatches.length > 0) {
          const extractedText = textMatches
            .map(match => match.slice(1, -1))
            .filter(text => text.length > 2)
            .join(' ')
          
          if (extractedText.length > 10) {
            console.log(`Fallback extraction found ${extractedText.length} characters`)
            return extractedText
          }
        }
      } catch (fallbackError) {
        console.error('Fallback PDF extraction failed:', fallbackError)
      }
      
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown PDF error'}. The PDF might be encrypted, corrupted, or contain only images.`)
    }
  }

  private static async processDocx(buffer: Buffer): Promise<string> {
    try {
      // Dynamically import mammoth
      const mammoth = (await import('mammoth')).default
      
      const result = await mammoth.extractRawText({ buffer })
      console.log(`DOCX processed: ${result.value.length} characters`)
      if (result.messages && result.messages.length > 0) {
        console.log('DOCX processing messages:', result.messages)
      }
      return result.value || ''
    } catch (error) {
      console.error('DOCX parsing error:', error)
      throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown DOCX error'}`)
    }
  }

  private static async processText(buffer: Buffer): Promise<string> {
    return buffer.toString('utf-8')
  }

  static chunkDocument(content: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    if (content.length <= chunkSize) {
      return [content]
    }

    const chunks: string[] = []
    let start = 0

    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length)
      let chunk = content.slice(start, end)

      // Try to break at sentence boundary
      if (end < content.length) {
        const lastPeriod = chunk.lastIndexOf('. ')
        const lastNewline = chunk.lastIndexOf('\n')
        const breakPoint = Math.max(lastPeriod, lastNewline)
        
        if (breakPoint > start + chunkSize * 0.7) {
          chunk = content.slice(start, breakPoint + 1)
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
}