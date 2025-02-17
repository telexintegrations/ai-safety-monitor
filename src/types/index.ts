export interface TelexMessage {
  id: string
  content: string
  sender: string
  timestamp: number
  channelId: string
}

export interface TelexWebhookPayload {
  channel_id: string
  settings: TelexSetting[]
  message: string
}

export interface TelexSetting {
  label: string
  type: string
  description: string
  default: unknown
  required: boolean
}

export interface TelexResponse {
  event_name: string
  message: string
  status: string
  username: string
}

export interface SafetyAnalysisResult {
  isSafe: boolean
  score: number
  category?: string
  reason?: string
}

export interface FilterConfig {
  bannedWords: string[]
  minSafetyScore: number
  enableAICheck: boolean
  customPrompt?: string
  maxMessageLength?: number
  notifyAdmin?: boolean
}

export interface AdminNotification {
  channelId: string
  messageId: string
  content: string
  reason: string
  timestamp: number
  action: 'blocked' | 'flagged' | 'allowed'
}
