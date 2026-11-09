import { test } from '@playwright/test';
import { cleanupLocalHdf } from './local-hdf.helpers';

test('remove the local HDF test submission and restore an open check window', async ({ page }) => {
  test.setTimeout(3 * 60 * 1000);
  await cleanupLocalHdf(page);
});
