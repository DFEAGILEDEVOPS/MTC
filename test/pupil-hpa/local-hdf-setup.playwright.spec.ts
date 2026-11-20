import { test } from '@playwright/test';
import { prepareLocalHdf } from './local-hdf.helpers';

test('prepare a signed HDF for the local superuser summary tests', async ({ page }) => {
  test.setTimeout(8 * 60 * 1000);
  await prepareLocalHdf(page);
});
