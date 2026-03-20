import { test, expect } from '@playwright/test';

const baseUrl = process.env.PUPIL_API_BASE_URL ?? 'https://testauth-as-mtc.azurewebsites.net';

test('GET ping API', async ({ request }) => {
  const response = await request.get(`${baseUrl}/ping`);

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toBeTruthy();
});

test('POST auth API', async ({ request }) => {
  const response = await request.post(`${baseUrl}/auth`, {
    data: {
      schoolPin: 'abc12345',
      pupilPin: '9999a',
      buildVersion: 1
    }
  });

  expect(response.status()).toBe(401);

  const body = await response.json();
  expect(body.error).toBeTruthy();
});
