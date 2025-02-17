import { GoogleGenerativeAI } from '@google/generative-ai'
import { envConfig } from '../common/env'
import { SafetyAnalysisResult } from '../types'

const genAI = new GoogleGenerativeAI(envConfig.GEMINI_API_KEY)
const genAIModel = 'gemini-pro'

async function generateSafetyPrompt(content: string, customPrompt?: string): Promise<string> {
  const basePrompt =
    customPrompt ||
    `
      You are an AI safety monitor. Analyze the following message for safety concerns.
      Consider:
      1. Harmful content (violence, hate speech, harassment)
      2. Inappropriate content (adult content, explicit language)
      3. Spam or misleading information
      4. Personal information or privacy concerns
      
      Return ONLY a JSON object in the following format (no markdown, no code blocks, just the raw JSON):
      {
        "isSafe": boolean,
        "score": number between 0 and 1,
        "category": string describing the type of violation if unsafe,
        "reason": string explaining why if unsafe
      }

      Message to analyze: "${content}"
    `

  return basePrompt
}

function cleanJsonResponse(text: string): string {
  // Remove any markdown code block indicators
  text = text.replace(/```json\s*/g, '')
  text = text.replace(/```\s*/g, '')

  // Find the first '{' and last '}' to extract just the JSON object
  const startIndex = text.indexOf('{')
  const endIndex = text.lastIndexOf('}') + 1

  if (startIndex === -1 || endIndex === 0) {
    throw new Error('No valid JSON object found in response')
  }

  return text.slice(startIndex, endIndex)
}

async function analyzeSafety(content: string, customPrompt?: string): Promise<SafetyAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: genAIModel })
    const prompt = await generateSafetyPrompt(content, customPrompt)

    const result = await model.generateContent(prompt)
    const response = result.response
    const analysisText = response.text()

    try {
      const cleanJson = cleanJsonResponse(analysisText)
      const analysis = JSON.parse(cleanJson)

      // Add emojis based on safety status
      const emoji = analysis.isSafe ? '✅' : '⛔'
      const reasonWithEmoji = analysis.reason ? `${emoji} ${analysis.reason}` : undefined

      return {
        isSafe: Boolean(analysis.isSafe),
        score: Number(analysis.score) || 0,
        category: analysis.category || undefined,
        reason: reasonWithEmoji,
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('Raw response:', analysisText)
      return {
        isSafe: false,
        score: 0,
        reason: '🚨 Error analyzing content safety',
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Candidate was blocked due to SAFETY')) {
      return {
        isSafe: false,
        score: 0,
        category: 'SAFETY_BLOCK',
        reason: '🛑 Content was blocked by AI safety filters due to potentially harmful content',
      }
    }

    console.error('Error in AI safety analysis:', error)
    throw new Error('Failed to analyze content safety')
  }
}

export const AISafetyController = {
  analyzeSafety,
}
