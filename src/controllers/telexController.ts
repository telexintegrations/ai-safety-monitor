import { TelexResponse } from '../types'

const TELEX_RETURN_URL = process.env.TELEX_RETURN_URL
const TELEX_CHANNEL_ID = process.env.TELEX_CHANNEL_ID

async function sendResponse(
  channelId: string,
  message: string,
  status: 'success' | 'error' = 'success',
): Promise<void> {
  channelId = channelId || TELEX_CHANNEL_ID
  const response: TelexResponse = {
    event_name: 'AI Safety Monitor',
    message,
    status,
    username: 'AI Safety Monitor',
  }

  try {
    const url = `${TELEX_RETURN_URL}/${channelId}`

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    }).then((res) => {
      if (!res.ok) {
        console.error('failed to send notification to telex')
      }
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error sending response to Telex:', error.message)
    } else {
      console.error('Error sending response to Telex:', error)
    }
  }
}

export const TelexController = {
  sendResponse,
}
