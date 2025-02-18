import { SafetyController } from '../../src/controllers/safetyController'
import { Request, Response } from 'express'
import { TelexSetting, TelexWebhookPayload } from '../../src/types'
import { AISafetyController } from '../../src/controllers/aiSafetyController'
import { ContentFilteringController } from '../../src/controllers/contentFilteringController'

// add mock for AI service
jest.mock('../../src/controllers/aiSafetyController.ts', () => ({
  AISafetyController: {
    analyzeSafety: jest.fn().mockResolvedValue({
      isSafe: true,
      score: 0.9,
      reason: 'No issues detected',
    }),
  },
}))

// update mock for content filtering to be synchronous
jest.mock('../../src/controllers/contentFilteringController.ts', () => ({
  ContentFilteringController: {
    checkContent: jest.fn().mockReturnValue({
      isSafe: true,
      reason: null,
    }),
  },
}))

const testApiKey = 'test-key'

describe('Safety Controller', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let responseObject: Record<string, unknown> = {}

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    responseObject = {}
    mockRequest = {
      body: {
        message: 'Test message',
        settings: [
          {
            label: 'bannedWords',
            type: 'text',
            description: 'List of words to automatically block',
            default: [
              'hate',
              'racist',
              'nazi',
              'kill',
              'murder',
              'suicide',
              'terrorist',
              'bomb',
              'attack',
              'abuse',
              'harass',
              'threat',
              'violence',
              'slut',
              'whore',
              'fuck',
              'shit',
              'cunt',
              'bitch',
              'asshole',
              'bastard',
              'damn',
              'hell',
              'piss',
              'dick',
              'cock',
              'pussy',
              'fag',
              'retard',
              'idiot',
              'moron',
              'stupid',
              'loser',
              'fatso',
              'ugly',
              'crap',
              'suck',
            ],
            required: false,
          },
          {
            label: 'minSafetyScore',
            type: 'number',
            description: 'Minimum safety score (0-1) for messages to be allowed',
            default: 0.7,
            required: false,
          },
          {
            label: 'enableAICheck',
            type: 'checkbox',
            description: 'Enable AI-powered safety analysis',
            default: true,
            required: false,
          },
          {
            label: 'customPrompt',
            type: 'text',
            description: 'Custom prompt for AI safety analysis',
            default: '',
            required: false,
          },
          {
            label: 'maxMessageLength',
            type: 'number',
            description: 'Maximum allowed message length',
            default: 1000,
            required: false,
          },
          {
            label: 'geminiApiKey',
            type: 'text',
            description: 'Google Gemini API key',
            default: testApiKey,
            required: true,
          },
        ],
      } as TelexWebhookPayload,
    }

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result
        return mockResponse
      }),
    }
  })

  test('should handle safe message', async () => {
    await SafetyController.handleWebhook(mockRequest as Request, mockResponse as Response)

    expect(ContentFilteringController.checkContent).toHaveBeenCalledWith(mockRequest.body.message)
    expect(AISafetyController.analyzeSafety).toHaveBeenCalledWith(testApiKey, mockRequest.body.message, '')
    expect(mockResponse.status).toHaveBeenCalledWith(200)
    expect(responseObject.status).toBe('success')
  })

  test('should block message with banned words', async () => {
    mockRequest.body.message = 'This message contains fuck'
    await SafetyController.handleWebhook(mockRequest as Request, mockResponse as Response)
    expect(responseObject.status).toBe('blocked')
  })

  test('should handle message exceeding length limit', async () => {
    const maxMsgSetting = mockRequest.body.settings.find(
      (setting: TelexSetting) => setting.label === 'maxMessageLength',
    )
    if (maxMsgSetting) {
      maxMsgSetting.default = 10
    }
    mockRequest.body.message = 'This message is too long for the limit'

    await SafetyController.handleWebhook(mockRequest as Request, mockResponse as Response)
    expect(responseObject.status).toBe('blocked')
  })
})
