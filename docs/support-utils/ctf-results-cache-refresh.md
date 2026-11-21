# CTF and Results Cache Refresh After Pupil Name or UPN Changes

## Overview

If a school's HDF has already been signed and the CTF file is available for download, changing a pupil's name or UPN does not automatically update the Results page or the downloaded CTF file.

This happens because the Results page and the CTF download both use the cached school results dataset stored in Redis under the following key:

`result:${schoolId}`

Dropping the pupil register cache alone is not enough.

## What you will see

After a pupil's name or UPN is edited:

- the pupil register may show the updated details
- the Results page may still show the old name or UPN
- the CTF download may still contain the old name or UPN

## Why this happens

The Results page and the CTF download both read from the same cached results dataset.

That cache key is:

`result:${schoolId}`

If only the pupil register cache is cleared, the results dataset stays unchanged, so the Results page and CTF continue to show the previous pupil details.

This is why changing a pupil's reason for not taking the check can appear to fix the issue. That workflow refreshes the results cache, which causes the Results page and CTF data to be rebuilt.

## Required action

If the HDF has been signed and the CTF is available for download, and a pupil's name or UPN is updated, the school results Redis cache must be dropped before the change will appear in:

- the Results page
- the CTF download

## How to drop the cache

You must have a Tech Support role in the admin app.

1. Sign in to the admin app as a Tech Support user.
2. Open the Tech Support area.
3. Open Redis overview.
4. Select Drop a key from Redis.
5. Enter the Redis key in this format:

   `result:${schoolId}`

6. Replace `${schoolId}` with the database school id for the school.
7. Continue to the confirmation page.
8. Confirm the drop.
9. Reload the Results page or download the CTF again.

## Example

If the school id is `12345`, enter:

`result:12345`

## Important note

Dropping this key removes the cached school results dataset only. On the next request, the Results page or CTF download will rebuild the data and should then show the updated pupil name or UPN.

Dropping this key is the important step. Dropping only:

`pupilRegisterViewData:${schoolId}`

will not refresh the Results page or the CTF download.
