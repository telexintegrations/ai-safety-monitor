import { Response, Request } from 'express'
import { FilterConfig, SafetyAnalysisResult, TelexSetting, TelexWebhookPayload } from '../types'
import { ContentFilteringController } from './contentFilteringController'
import { AISafetyController } from './aiSafetyController'
import { envConfig } from '../common/env'

const getSettingValue = <T>(settings: TelexSetting[], label: string, defaultValue: T): T => {
  const setting = settings.find((s) => s.label === label)
  return setting ? (setting.default as T) : defaultValue
}

const getFilterConfig = (settings: TelexSetting[]): FilterConfig => ({
  bannedWords: getSettingValue<string[]>(settings, 'bannedWords', []),
  minSafetyScore: getSettingValue<number>(settings, 'minSafetyScore', 0.7),
  enableAICheck: getSettingValue<boolean>(settings, 'enableAICheck', true),
  customPrompt: getSettingValue<string>(settings, 'customPrompt', ''),
  maxMessageLength: getSettingValue<number>(settings, 'maxMessageLength', 1000),
  notifyAdmin: getSettingValue<boolean>(settings, 'notifyAdmin', true),
  geminiApiKey: getSettingValue<string>(settings, 'geminiApiKey', ''),
})

const containsBannedWords = (content: string, bannedWords: string[] | string): boolean => {
  if (typeof bannedWords === 'string') {
    bannedWords = bannedWords.split(',')
  }

  const lowerContent = content.toLowerCase()

  const result = bannedWords.some((word) => {
    // Use word boundaries to ensure we match whole words only
    const regex = new RegExp(`\\b${word.toLowerCase()}\\b`)
    const match = regex.test(lowerContent)
    return match
  })

  return result
}

export const returnWebhookResponse = (res: Response, status: 'success' | 'blocked', reason: string) => {
  const message = `<span>${reason}</span><br><br><hr/><i>Auto-moderated by AI Safety Monitor</i>`
  return res.status(200).json({ status, message })
}

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body as TelexWebhookPayload
    const { message, settings } = payload

    const config = getFilterConfig(settings)

    const preliminaryCheck = ContentFilteringController.checkContent(message)

    if (!preliminaryCheck.isSafe) {
      return returnWebhookResponse(res, 'blocked', preliminaryCheck.reason || 'Content blocked by filter')
    }

    const containsBannedWordsCheck = containsBannedWords(message, config.bannedWords)

    if (containsBannedWordsCheck) {
      return returnWebhookResponse(res, 'blocked', '🚫 Message contains banned words')
    }

    if (config.maxMessageLength && message.length > config.maxMessageLength) {
      return returnWebhookResponse(res, 'blocked', '📏 Message exceeds maximum length')
    }

    if (config.enableAICheck) {
      const analysis: SafetyAnalysisResult = await AISafetyController.analyzeSafety(
        config?.geminiApiKey || envConfig.GEMINI_API_KEY,
        message,
        config.customPrompt,
      )
      if (!analysis.isSafe || analysis.score < config.minSafetyScore) {
        const action = analysis.score < config.minSafetyScore / 2 ? 'blocked' : 'flagged'
        const reason = analysis.reason || `Safety score too low: ${analysis.score}`
        return returnWebhookResponse(res, action === 'blocked' ? 'blocked' : 'success', reason)
      }
    }

    return returnWebhookResponse(res, 'success', message)
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error processing webhook:', error.message)
    } else {
      console.error('Error processing webhook:', error)
    }
    return returnWebhookResponse(res, 'blocked', 'Unable to process message')
  }
}

export const SafetyController = {
  handleWebhook,
}
