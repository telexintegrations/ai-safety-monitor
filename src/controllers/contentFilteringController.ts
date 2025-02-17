import { SafetyAnalysisResult } from '../types'
import { Filter } from 'bad-words'

const filter = new Filter()

const sensitivePatterns = [
  /\b\d{16}\b/, // Credit card numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email addresses
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
  /\b\d{3}[-]?\d{2}[-]?\d{4}\b/, // SSN pattern
]

function checkContent(content: string): SafetyAnalysisResult {
  // Check for profanity
  if (filter.isProfane(content)) {
    return {
      isSafe: false,
      score: 0,
      category: 'PROFANITY',
      reason: '🚫 Message contains inappropriate language',
    }
  }

  // Check for sensitive data patterns
  for (const pattern of sensitivePatterns) {
    if (pattern.test(content)) {
      return {
        isSafe: false,
        score: 0,
        category: 'SENSITIVE_DATA',
        reason: '🔒 Message contains sensitive information',
      }
    }
  }

  // Check for spam-like patterns
  if (this.isSpamLike(content)) {
    return {
      isSafe: false,
      score: 0.3,
      category: 'SPAM',
      reason: '📢 Message appears to be spam',
    }
  }

  return {
    isSafe: true,
    score: 1,
    category: 'SAFE',
    reason: undefined,
  }
}

function isSpamLike(content: string): boolean {
  const lowerContent = content.toLowerCase()

  // Check for repetitive characters
  if (/(.)\1{4,}/.test(content)) {
    return true
  }

  // Check for common spam phrases
  const spamPhrases = ['win free', 'click here', 'act now', 'limited time', 'buy now', 'subscribe now', 'special offer']

  return spamPhrases.some((phrase) => lowerContent.includes(phrase))
}

export const ContentFilteringController = {
  checkContent,
  isSpamLike,
}
