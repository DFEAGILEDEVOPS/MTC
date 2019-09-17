### Analysis day 27th Aug 2019
- Establish 'pupil state' design.
  - Add columns to pupil table?
  - have separate pupil state table?
  - eliminate pupil status function and infer state from pupil state
- Restarts
  - attach to pupil table directly
  - pupil restart table serves as a log/audit trail
  - bind to check on creation?
  - create check as part of restart procedure?
  - invalidate entire restart & check at end of day if not used?
  - is this OK with UX/business?

### Pupil Journey Meeting Friday 13th September 2019
- pupil logged on still required - not a status anymore
- when validation fails, notify teacher
  - sent from validation service to the check-notifier
- when marking fails, inform teacher
  - sent from marking service to the check-notifier

### Tech session Monday 16th September 2019
- checkConfig.  move to table storage?
- it is currently the authority on a checks used config
- what is the composite index? pupil uuid/check code
