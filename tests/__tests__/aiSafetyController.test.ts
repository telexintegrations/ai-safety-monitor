/* eslint-disable @typescript-eslint/no-explicit-any */
import { AISafetyController } from '../../src/controllers/aiSafetyController'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Mock the GoogleGenerativeAI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(),
}))

describe('AISafetyController', () => {
  const mockApiKey = 'test-api-key'

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    ;(AISafetyController as any).genAI = null
  })

  describe('analyzeSafety', () => {
    const createMockGenerativeAI = (responseText: string) => {
      const mockGenerateContent = jest.fn().mockImplementation(async (prompt) => {
        // Customize response based on the input message
        if (prompt.includes('Unsafe message')) {
          return {
            response: {
              text: () =>
                JSON.stringify({
                  isSafe: false,
                  score: 0.2,
                  category: 'HARMFUL_CONTENT',
                  reason: 'Potential harmful content detected',
                }),
            },
          }
        }

        if (prompt.includes('Invalid JSON')) {
          return {
            response: {
              text: () => 'Not a valid JSON',
            },
          }
        }

        if (prompt.includes('Overscore')) {
          return {
            response: {
              text: () =>
                JSON.stringify({
                  isSafe: true,
                  score: 1.5,
                  category: 'SAFE',
                  reason: 'No issues detected',
                }),
            },
          }
        }

        // Default safe response
        return {
          response: {
            text: () => responseText,
          },
        }
      })

      const mockGetGenerativeModel = jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      })

      ;(GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>).mockImplementation(
        () =>
          ({
            getGenerativeModel: mockGetGenerativeModel,
          }) as any,
      )
    }

    it('should return blocked status if no API key is provided', async () => {
      const result = await AISafetyController.analyzeSafety('', 'Test message')

      expect(result).toEqual({
        isSafe: false,
        score: 0,
        category: 'SAFETY_BLOCK',
        reason: expect.stringContaining('🛑 Content was blocked by AI safety filters'),
      })
    })

    it('should handle successful safe content analysis', async () => {
      createMockGenerativeAI(
        JSON.stringify({
          isSafe: true,
          score: 0.9,
          category: 'SAFE',
          reason: 'No issues detected',
        }),
      )

      const result = await AISafetyController.analyzeSafety(mockApiKey, 'Safe message')

      expect(result).toEqual({
        isSafe: true,
        score: 0.9,
        category: 'SAFE',
        reason: '✅ No issues detected',
      })
    })

    it('should handle unsafe content analysis', async () => {
      createMockGenerativeAI(
        JSON.stringify({
          isSafe: false,
          score: 0.2,
          category: 'HARMFUL_CONTENT',
          reason: 'Potential harmful content detected',
        }),
      )

      const result = await AISafetyController.analyzeSafety(mockApiKey, 'Unsafe message')

      expect(result).toEqual({
        isSafe: false,
        score: 0.2,
        category: 'HARMFUL_CONTENT',
        reason: '⛔ Potential harmful content detected',
      })
    })

    it('should handle invalid JSON response', async () => {
      createMockGenerativeAI('Invalid JSON')

      const result = await AISafetyController.analyzeSafety(mockApiKey, 'Invalid JSON message')

      expect(result).toEqual({
        isSafe: false,
        score: 0,
        reason: '🚨 Error analyzing content safety',
      })
    })

    it('should validate score between 0 and 1', async () => {
      createMockGenerativeAI(
        JSON.stringify({
          isSafe: true,
          score: 1.5,
          category: 'SAFE',
          reason: 'No issues detected',
        }),
      )

      const result = await AISafetyController.analyzeSafety(mockApiKey, 'Overscore message')

      expect(result).toEqual({
        isSafe: true,
        score: 1,
        category: 'SAFE',
        reason: '✅ No issues detected',
      })
    })

    it('should handle generation content errors', async () => {
      // Completely reset the mock for this specific test
      jest.resetAllMocks()

      const mockGenerateContent = jest.fn().mockImplementation(() => {
        throw new Error('Generation error')
      })

      const mockGetGenerativeModel = jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      })

      ;(GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>).mockImplementation(
        () =>
          ({
            getGenerativeModel: mockGetGenerativeModel,
          }) as any,
      )

      const result = await AISafetyController.analyzeSafety(mockApiKey, 'Test message')

      expect(result).toEqual({
        isSafe: false,
        score: 0,
        category: 'SAFETY_BLOCK',
        reason: '🛑 Content was blocked by AI safety filters due to potentially harmful content',
      })
    })
  })
})
