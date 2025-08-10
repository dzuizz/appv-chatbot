import { NextRequest, NextResponse } from 'next/server'
import { DocumentProcessor } from '@/lib/document-processor'
import { vectorStore } from '@/lib/vector-store'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log(`Upload request: file name="${file.name}", type="${file.type}", size=${file.size}`)

    // Validate file type - be more flexible with MIME types
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown',
      '' // Some browsers don't set MIME type for text files
    ]
    
    const fileExtension = file.name.toLowerCase().split('.').pop()
    const allowedExtensions = ['pdf', 'docx', 'doc', 'txt', 'md', 'markdown']
    
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension || '')
    
    if (!isValidType) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type} (${fileExtension}). Please upload PDF, DOCX, TXT, or MD files.` },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Process the document
    let processedDoc
    try {
      processedDoc = await DocumentProcessor.processFile(file)
    } catch (docError) {
      console.error('Document processing error:', docError)
      // Log the full error for debugging
      if (docError instanceof Error) {
        console.error('Error stack:', docError.stack)
      }
      return NextResponse.json(
        { 
          error: `Failed to process document: ${docError instanceof Error ? docError.message : 'Unknown error'}`,
          fileInfo: {
            name: file.name,
            type: file.type,
            size: file.size,
            extension: file.name.toLowerCase().split('.').pop()
          }
        },
        { status: 400 }
      )
    }
    
    if (!processedDoc.content || processedDoc.content.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text content found in the file' },
        { status: 400 }
      )
    }

    // Add to vector store
    try {
      await vectorStore.addDocument(processedDoc.content, {
        filename: processedDoc.metadata.filename,
        fileType: processedDoc.metadata.fileType
      })
    } catch (vectorError) {
      console.error('Vector store error:', vectorError)
      return NextResponse.json(
        { error: 'Failed to add document to knowledge base' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Document uploaded and processed successfully',
      document: {
        filename: processedDoc.metadata.filename,
        wordCount: processedDoc.metadata.wordCount,
        processedAt: processedDoc.metadata.processedAt
      },
      stats: vectorStore.getStats()
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const stats = vectorStore.getStats()
    const documents = vectorStore.getDocuments()
    
    return NextResponse.json({
      documents,
      stats
    })
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { error: 'Failed to get documents' },
      { status: 500 }
    )
  }
}