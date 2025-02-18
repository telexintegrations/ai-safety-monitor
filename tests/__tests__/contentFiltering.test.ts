import { ContentFilteringController } from '../../src/controllers/contentFilteringController'

describe('Content Filtering Controller', () => {
  describe('checkContent', () => {
    test('should detect profanity', () => {
      const result = ContentFilteringController.checkContent('This can kill and fuck you up')
      expect(result.isSafe).toBe(false)
      expect(result.category).toBe('PROFANITY')
    })

    test('should detect sensitive data', () => {
      const result = ContentFilteringController.checkContent('My credit card is 4111111111111111')
      expect(result.isSafe).toBe(false)
      expect(result.category).toBe('SENSITIVE_DATA')
    })

    test('should detect email addresses', () => {
      const result = ContentFilteringController.checkContent('Contact me at test@example.com')
      expect(result.isSafe).toBe(false)
      expect(result.category).toBe('SENSITIVE_DATA')
    })

    test('should detect phone numbers', () => {
      const result = ContentFilteringController.checkContent('Call me at 123-456-7890')
      expect(result.isSafe).toBe(false)
      expect(result.category).toBe('SENSITIVE_DATA')
    })

    test('should detect spam content', () => {
      const result = ContentFilteringController.checkContent('CLICK HERE!!! Limited time offer!!!')
      expect(result.isSafe).toBe(false)
      expect(result.category).toBe('SPAM')
    })

    test('should pass safe content', () => {
      const result = ContentFilteringController.checkContent('This is a normal message')
      expect(result.isSafe).toBe(true)
      expect(result.category).toBe('SAFE')
    })

    test('should detect repetitive characters', () => {
      expect(ContentFilteringController.isSpamLike('Heyyyyyyyyy')).toBe(true)
    })

    test('should detect spam phrases', () => {
      expect(ContentFilteringController.isSpamLike('CLICK HERE for a special offer!')).toBe(true)
    })

    test('should pass normal text', () => {
      expect(ContentFilteringController.isSpamLike('This is a normal message')).toBe(false)
    })
  })
})
