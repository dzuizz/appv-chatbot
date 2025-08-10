import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('=== TEST UPLOAD ENDPOINT HIT ===')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.log('No file in request')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log(`File received:`, {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    })
    
    // Basic file validation
    const allowedExtensions = ['txt', 'md', 'pdf', 'docx', 'doc']
    const fileExtension = file.name.toLowerCase().split('.').pop()
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      console.log(`Unsupported extension: ${fileExtension}`)
      return NextResponse.json({ 
        error: `Unsupported file type: ${fileExtension}. Supported: ${allowedExtensions.join(', ')}` 
      }, { status: 400 })
    }

    // Try to read basic file info
    const buffer = await file.arrayBuffer()
    console.log(`Buffer created successfully, size: ${buffer.byteLength}`)

    // For text files, try to read content
    if (['txt', 'md'].includes(fileExtension)) {
      try {
        const content = new TextDecoder().decode(buffer)
        const preview = content.slice(0, 200)
        console.log(`Text content preview (${content.length} chars): ${preview}...`)
        
        return NextResponse.json({
          success: true,
          message: 'Basic text file processing successful',
          data: {
            filename: file.name,
            type: file.type,
            size: file.size,
            extension: fileExtension,
            contentLength: content.length,
            contentPreview: preview
          }
        })
      } catch (textError) {
        console.error('Text processing error:', textError)
        return NextResponse.json({
          error: `Failed to process text file: ${textError instanceof Error ? textError.message : 'Unknown error'}`
        }, { status: 500 })
      }
    }

    // For other files (PDF, DOCX), just return basic info
    return NextResponse.json({
      success: true,
      message: `File received successfully (${fileExtension} processing not implemented in test endpoint)`,
      data: {
        filename: file.name,
        type: file.type,
        size: file.size,
        extension: fileExtension,
        bufferSize: buffer.byteLength
      }
    })

  } catch (error) {
    console.error('=== TEST UPLOAD ERROR ===', error)
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json({
      error: `Test upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error instanceof Error ? error.stack : 'No details available'
    }, { status: 500 })
  }
}