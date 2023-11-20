# Check & Pin Generation

## Current journey

- pupilPinController.postGeneratePins
  - get check window
  - determine eligibility to generate pin
  - find school
  - generate school password if necessary (refactor already in progress)
- checkStartService.prepareCheck2
  - get pupils eligible for pin generation
  - validate that they are still eligible (non db call)
  - get all check forms (cached)
  - get forms used by pupil
  - checkStartService.initialisePupilCheck (call per pupil)
    - allocate check form
    - get pin expiry time
  - create checks in batch
  - find checks by pupil id
  - create pupil check payloads
  - prepare checks
  - store check configs

## proposals
- spCreateChecks returns check payload data, rather than just ids
  - this eliminates 2 calls
- cache sas tokens for 1 hour (configurable)
- new service 'check allocation / preparation'
- smaller distinct services with single purpose
- more robust (include rollbacks)

## Concerns

- not easy to navigate / maintain
- not optimised
- naming issues
- data / object bloat
- should this be out of process? (in a function etc)
