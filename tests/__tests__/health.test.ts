import supertest from 'supertest'
import app from '../../src/app'

const request = supertest(app)

describe('API Health Check', () => {
  test('Health endpoint should return 200', async () => {
    const response = await request.get('/health')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      'health-check': 'OK: top level api working',
    })
  })

  test('Unknown endpoint should return 404', async () => {
    const response = await request.get('/nonExistingEndpoint')
    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'unknown endpoint' })
  })
})
