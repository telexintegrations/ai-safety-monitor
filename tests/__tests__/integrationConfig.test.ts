import supertest from 'supertest'
import app from '../../src/app'

const request = supertest(app)

describe('Integration Config Test', () => {
  test('Integration Config endpoint should return 200', async () => {
    const response = await request.get('/integration-config')
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('data')
    expect(response.body.data).toHaveProperty('date')
    expect(response.body.data).toHaveProperty('integration_category')
    expect(response.body.data).toHaveProperty('integration_type')
    expect(response.body.data).toHaveProperty('descriptions')
    expect(response.body.data).toHaveProperty('target_url')
    expect(response.body.data).toHaveProperty('key_features')
    expect(response.body.data).toHaveProperty('settings')
    expect(response.body.data).toHaveProperty('endpoints')
    expect(response.body.data).toHaveProperty('is_active')
    expect(response.body.data).toHaveProperty('author')
    expect(response.body.data).toHaveProperty('version')
  })
})
