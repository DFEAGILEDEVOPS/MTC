import { test, expect } from '@playwright/test';

const baseUrl = process.env.PUPIL_API_BASE_URL ?? 'https://testauth-as-mtc.azurewebsites.net';

test.describe('Pupil API remote contract via APIRequestContext', () => {
  test('GET /ping returns 200 and JSON', async ({ request }) => {
    const response = await request.get(`${baseUrl}/ping`);

    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'] ?? '';
    expect(contentType).toContain('application/json');

    const body = await response.json();
    expect(body).toBeTruthy();
  });

  test('GET /auth returns 405 Method Not Allowed', async ({ request }) => {
    const response = await request.get(`${baseUrl}/auth`);

    expect(response.status()).toBe(405);
    expect(response.statusText()).toBe('Method Not Allowed');
  });

  test('POST /auth with invalid credentials returns 401', async ({ request }) => {
    const response = await request.post(`${baseUrl}/auth`, {
      data: {
        schoolPin: 'abc12345',
        pupilPin: '9999a',
        buildVersion: 1
      }
    });

    expect(response.status()).toBe(401);
    const payload = await response.json();
    expect(payload.error).toBeTruthy();
  });
});