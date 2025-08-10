import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' })

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log(`Generating embedding for text (${text.length} chars): "${text.slice(0, 100)}..."`)
    const result = await embeddingModel.embedContent(text)
    console.log(`Embedding generated successfully: ${result.embedding.values.length} dimensions`)
    return result.embedding.values
  } catch (error) {
    console.error('Error generating embedding:', error)
    console.error('Text that failed:', text.slice(0, 200))
    throw error
  }
}

export async function generateResponse(prompt: string, context?: string): Promise<string> {
  try {
    const fullPrompt = context 
      ? `Context: ${context}\n\nQuestion: ${prompt}\n\nAnswer based on the context provided above. If the context doesn't contain relevant information, say so.`
      : prompt

    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating response:', error)
    throw error
  }
}