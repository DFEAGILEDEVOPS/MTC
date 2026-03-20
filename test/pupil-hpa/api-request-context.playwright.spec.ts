import { test, expect, APIRequestContext } from '@playwright/test';

const baseUrl = process.env.PUPIL_API_BASE_URL ?? process.env.BASE_URL ?? 'http://localhost:3001';

async function postQuestions(request: APIRequestContext) {
  const response = await request.post(`${baseUrl}/api/questions`, {
    data: {
      schoolPin: 'abc12345',
      pupilPin: '9999a'
    }
  });

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  return response.json();
}

test.describe('Pupil API via APIRequestContext', () => {
  test('GET /api/questions returns 405', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/questions`);
    expect(response.status()).toBe(405);
    expect(response.statusText()).toBe('Method Not Allowed');
  });

  test('POST /api/questions returns expected question payload', async ({ request }) => {
    const payload = await postQuestions(request);

    expect(payload.access_token).toBeTruthy();
    expect(Array.isArray(payload.questions)).toBeTruthy();
    expect(payload.questions).toHaveLength(10);
    expect(payload.pupil.firstName).toBe('Standard');
    expect(payload.pupil.lastName).toBe('Pupil');
    expect(payload.school.id).toBe(18600);
    expect(payload.school.name).toBe('Test School');
    expect(payload.config.questionTime).toBe(6);
    expect(payload.config.loadingTime).toBe(3);
  });

  test('POST /api/check-started returns 201 for valid credentials', async ({ request }) => {
    const questionsPayload = await postQuestions(request);

    const checkStartedResponse = await request.post(`${baseUrl}/api/check-started`, {
      data: {
        checkCode: questionsPayload.pupil.checkCode,
        accessToken: questionsPayload.access_token
      }
    });

    expect(checkStartedResponse.status()).toBe(201);
  });
});