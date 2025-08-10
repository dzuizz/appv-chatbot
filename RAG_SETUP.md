# RAG-Powered Study Assistant with Gemini AI

This is a complete implementation of a RAG (Retrieval-Augmented Generation) chatbot system using Google's Gemini AI API. The system allows users to upload documents and ask questions based on the uploaded content.

## Features

- **Document Upload**: Support for PDF, DOCX, TXT, and Markdown files
- **RAG Implementation**: Vector embeddings with similarity search
- **Real-time Chat**: Powered by Google Gemini AI
- **Document Management**: View and manage uploaded documents
- **Source Citations**: Shows which documents were used to answer questions
- **Responsive UI**: Modern interface with dark/light theme support

## Setup Instructions

### 1. Install Dependencies

The required packages have already been installed:
```bash
npm install @google/generative-ai pdf-parse mammoth @xenova/transformers
```

### 2. Configure Environment Variables

1. Get a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Update the `.env.local` file:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to use the application.

## How to Use

1. **Upload Documents**: Click the 📎 (paperclip) icon in the chat input to upload PDF, DOCX, TXT, or MD files
2. **Ask Questions**: Type questions about your uploaded documents
3. **View Sources**: The AI will show which documents and sections were used to answer your questions
4. **Manage Documents**: Click "Documents" in the sidebar to view uploaded files and statistics
5. **Settings & Help**: Access settings and help from the sidebar

## System Architecture

### Core Components

- **`/lib/gemini.ts`**: Gemini AI API configuration and wrapper functions
- **`/lib/document-processor.ts`**: File processing utilities for different document types
- **`/lib/vector-store.ts`**: In-memory vector database with similarity search
- **`/lib/rag-service.ts`**: RAG orchestration service
- **`/api/upload/route.ts`**: Document upload API endpoint
- **`/api/chat/route.ts`**: Chat API endpoint with RAG integration

### RAG Flow

1. **Document Processing**: Files are converted to text and split into chunks
2. **Embedding Generation**: Text chunks are converted to vector embeddings using Gemini
3. **Vector Storage**: Embeddings are stored in an in-memory vector database
4. **Query Processing**: User questions are embedded and used to find similar document chunks
5. **Context Retrieval**: Relevant chunks are retrieved and formatted as context
6. **Response Generation**: Gemini generates answers using the retrieved context

## Supported File Types

- **PDF** (`.pdf`): Extracted using pdf-parse
- **Word Documents** (`.docx`): Extracted using mammoth
- **Text Files** (`.txt`): Direct text processing
- **Markdown** (`.md`): Direct text processing

## Technical Details

### Vector Search
- Uses Gemini's `text-embedding-004` model for embeddings
- Cosine similarity for finding relevant chunks
- Configurable chunk size (default: 1000 characters with 200 character overlap)

### Error Handling
- Comprehensive error handling for API calls
- File validation (type and size limits)
- Graceful fallbacks when no context is available

### Performance
- In-memory storage for fast retrieval
- Chunked processing for large documents
- Optimized embedding generation

## Limitations

- **Storage**: Documents are stored in memory (resets on server restart)
- **Scale**: Suitable for personal/small team use
- **File Size**: 10MB maximum file size
- **Concurrent Users**: Single-user optimized

## Future Enhancements

To scale this system for production:

1. **Persistent Storage**: Replace in-memory storage with a vector database (Pinecone, Chroma, etc.)
2. **User Management**: Add authentication and user-specific document libraries
3. **Advanced Chunking**: Implement semantic chunking strategies
4. **Streaming Responses**: Add real-time streaming for better UX
5. **Document Updates**: Support for updating and deleting specific documents
6. **Search Analytics**: Track popular queries and improve retrieval

## API Endpoints

### POST /api/upload
Upload and process documents
- **Body**: FormData with 'file' field
- **Returns**: Processing status and document metadata

### GET /api/upload
Get uploaded documents and statistics
- **Returns**: List of documents and storage statistics

### POST /api/chat
Send chat messages with RAG
- **Body**: `{ message: string, useRag: boolean }`
- **Returns**: AI response with source citations

## Development

### File Structure
```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts
│   │   └── upload/route.ts
│   └── page.tsx
├── components/
│   ├── ChatInput.tsx
│   ├── DocumentManager.tsx
│   ├── Settings.tsx
│   └── Help.tsx
└── lib/
    ├── gemini.ts
    ├── document-processor.ts
    ├── vector-store.ts
    └── rag-service.ts
```

The system is now fully functional and ready for use!