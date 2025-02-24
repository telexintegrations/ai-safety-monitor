import { GoogleGenerativeAI } from '@google/generative-ai'
import { SafetyAnalysisResult } from '../types'

let genAI: GoogleGenerativeAI | null = null
const genAIModel = 'gemini-1.5-flash'

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

async function analyzeSafety(apiKey: string, content: string, customPrompt?: string): Promise<SafetyAnalysisResult> {
  try {
    if (!genAI && apiKey) {
      genAI = new GoogleGenerativeAI(apiKey)
    }

    if (!genAI) {
      return {
        isSafe: false,
        score: 0,
        category: 'SAFETY_BLOCK',
        reason:
          '🛑 Content was blocked by AI safety filters due to Google Generative AI client not initialized, Update the API key in the integration config',
      }
    }

    const model = genAI.getGenerativeModel({ model: genAIModel })
    const prompt = await generateSafetyPrompt(content, customPrompt)
    console.log('Generated prompt:', prompt)

    const result = await model.generateContent(prompt)
    const response = result.response
    const analysisText = response.text()
    console.log('Raw AI response:', analysisText)

    try {
      const cleanJson = cleanJsonResponse(analysisText)
      const analysis = JSON.parse(cleanJson)
      console.log('Parsed analysis:', analysis)

      // Validate score is between 0 and 1
      const validatedScore = Math.min(Math.max(Number(analysis.score) || 0, 0), 1)

      // Add emojis based on safety status
      const emoji = analysis.isSafe ? '✅' : '⛔'
      const reasonWithEmoji = analysis.reason ? `${emoji} ${analysis.reason}` : undefined

      return {
        isSafe: Boolean(analysis.isSafe),
        score: validatedScore,
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
    console.log('error occurred', error)
    if (error instanceof Error) {
      return {
        isSafe: false,
        score: 0,
        category: 'SAFETY_BLOCK',
        reason: '🛑 Content was blocked by AI safety filters due to potentially harmful content',
      }
    }

    console.error('Error in AI safety analysis:', error)
    return {
      isSafe: false,
      score: 0,
      category: 'SAFETY_BLOCK',
      reason: '🛑 Content was blocked by AI safety filters due to potentially harmful content',
    }
  }
}

export const AISafetyController = {
  analyzeSafety,
}
