const url = 'https://5lldpsml-3000.uks1.devtunnels.ms'

export const telexGeneratedConfig = {
  data: {
    date: {
      created_at: '2025-02-17',
      updated_at: '2025-02-17',
    },
    integration_category: 'AI & Machine Learning',
    integration_type: 'modifier',
    descriptions: {
      app_name: 'AI Safety Monitor',
      app_description:
        'An AI-powered assistant that automatically monitors and filters messages for safety concerns using AI.',
      app_logo:
        'https://res.cloudinary.com/devsource/image/upload/v1737510989/pngtree-no-cursing-sign-png-image_6610915_meqkww.png',
      app_url: url,
      background_color: '#4A90E2',
    },
    target_url: `${url}/webhook`,
    key_features: [
      'Automatic AI responses to channel messages',
      'Uses conversation history as context for intelligent responses',
      "Powered by Google's Gemini AI for natural language understanding",
      'Maintains context of up to 50 recent messages',
      'Real-time message processing and response generation',
    ],
    settings: [
      {
        label: 'bannedWords',
        type: 'array',
        description: 'List of words to automatically block',
        default: ['bad', 'bad word', 'bad words', 'test'],
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
        type: 'boolean',
        description: 'Enable AI-powered safety analysis',
        default: true,
        required: false,
      },
      {
        label: 'customPrompt',
        type: 'string',
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
        label: 'notifyAdmin',
        type: 'boolean',
        description: 'Notify admins about blocked/flagged messages',
        default: true,
        required: false,
      },
    ],
    endpoints: [
      {
        path: '/webhook',
        method: 'POST',
        description: 'Receives messages and returns AI-generated responses',
      },
      {
        path: '/health',
        method: 'GET',
        description: 'Health check endpoint',
      },
    ],
    is_active: true,
    author: 'JC CODER',
    version: '1.0.0',
  },
}
