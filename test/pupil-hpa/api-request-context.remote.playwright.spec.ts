import { test, expect, type APIResponse } from '@playwright/test';

const pupilApiBaseUrl = process.env.PUPIL_API_BASE_URL ?? 'https://testauth-as-mtc.azurewebsites.net';
const adminBaseUrl = process.env.ADMIN_BASE_URL ?? 'https://testadmin-as-mtc.azurewebsites.net';
const pupilBaseUrl = process.env.PUPIL_BASE_URL ?? 'https://testpupil-as-mtc.azurewebsites.net';
const expectedBuildNumber = process.env.BUILD_BUILDNUMBER;
const expectedCommitId = process.env.BUILD_SOURCEVERSION;

type ReleaseMetadata = {
  Build: string;
  Commit: string;
  CurrentServerTime: string | number;
};

async function expectReleaseMetadata (
  response: APIResponse
): Promise<ReleaseMetadata> {
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type'] ?? '').toContain('application/json');

  const metadata = await response.json() as ReleaseMetadata;
  expect(metadata.Build).toContain(expectedBuildNumber);
  expect(metadata.Commit.trim()).toContain(expectedCommitId);
  expect(metadata.CurrentServerTime).toBeTruthy();
  return metadata;
}

test.describe('Pupil API remote contract via APIRequestContext', () => {
  test('GET /ping returns 200 and JSON', async ({ request }) => {
    const response = await request.get(`${pupilApiBaseUrl}/ping`);

    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'] ?? '';
    expect(contentType).toContain('application/json');

    const body = await response.json();
    expect(body).toBeTruthy();
  });

  test('GET /auth returns 405 Method Not Allowed', async ({ request }) => {
    const response = await request.get(`${pupilApiBaseUrl}/auth`);

    expect(response.status()).toBe(405);
    expect(response.statusText()).toBe('Method Not Allowed');
  });

  test('POST /auth with invalid credentials returns 401', async ({ request }) => {
    const response = await request.post(`${pupilApiBaseUrl}/auth`, {
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

  test('deployed admin, pupil app, and pupil API expose this build and commit', async ({ request }) => {
    test.skip(
      expectedBuildNumber === undefined || expectedCommitId === undefined,
      'Requires BUILD_BUILDNUMBER and BUILD_SOURCEVERSION from the deployment pipeline.'
    );

    await expectReleaseMetadata(await request.get(`${adminBaseUrl}/ping`));
    await expectReleaseMetadata(await request.get(`${pupilApiBaseUrl}/ping`));

    const pupilAppResponse = await request.get(pupilBaseUrl);
    expect(pupilAppResponse.status()).toBe(200);
    const pupilAppHtml = await pupilAppResponse.text();
    expect(pupilAppHtml).toContain(`<meta name="build:number" content="${expectedBuildNumber}">`);
    expect(pupilAppHtml).toContain(`<meta name="build:commitId" content="${expectedCommitId}">`);
  });
});