import request from 'supertest';
import { createApp } from '../app.js';

describe('auth integration', () => {
  it('registers a customer and returns an access token', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Customer',
        email: 'customer@example.com',
        password: 'StrongPass123'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.user.email).toBe('customer@example.com');
  });
});
