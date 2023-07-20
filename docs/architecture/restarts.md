# Voiding & Re-taking a check

A check can be re-taken up to 2 times. allowing for 3 attempts in total
Discretionary restarts are also available, but can only be granted by the service manager

## Existing process
- identify pupils eligible for a restart (check logged into by pupil: `mtc_admin.check.pupilLoginDate IS NOT NULL`)
- create entry in `mtc_admin.pupilRestart`
- `mtc_admin.pupil.currentCheckId` is set to null
- restart can be deleted
- generate pin in standard way (restart can no longer be deleted)


## Current Problems
- There is no flag on the previous check to indicate that it is now void
- original check submitted and restart created before submitted check is processed?
- not straightforward to identify void checks
- restart deletion is complex and brittle
  - requires 'patching' the original check back to `mtc_admin.pupil.currentCheckId`
  - requires a multi stage process to revert the operation
