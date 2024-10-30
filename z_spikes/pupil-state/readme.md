# Pupil State

The pupil state is a composite of three key attributes

- Current check
- Restart state
- Attendance

## Decisions
- pupil logged in status is needed, but not surfaced

## Restarts

When a teacher creates a restart for a pupil, the following happens...
- entry is created in `mtc_admin.pupilRestart`
- `mtc_admin.check.pupilRestart_id` is updated with the restart id
- `mtc_admin.pupil.restartAvailable` flag is set to true
- existing allocated form in redis is removed (pin can be preserved)
- new form is allocated and stored in redis

## Unconsumed restart

If the restart is not used, should we provide a way for the teacher to remove
it, effectively reactivating the last check.


