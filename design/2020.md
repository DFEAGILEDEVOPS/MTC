# Design proposals for 2020 architecture

## Current questions
- restart: could require an existing receivedCheck to be overwritten / invalidated
  - insertOrUpdate rather than insertOrMerge as we want any prior validation/marking data to be removed
- restart: must invalidate existing allocated check
- restart: store on existing check, but indicate pupil is allowed restart (update pupil flags)
- checkConfig: move data and functionality to dedicated microservice/function?
- checkNotifier: mtc_admin columns to support processing errors
- preparedCheck: should this be in redis with TTL?

### Pupil API -> function
consider converting to function.
input trigger would be http
2nd input binding would be table storage with filter to get message automatically
#### why?
- less moving parts, part of a function app
- no docker/server to maintain
#### why not?
- extra dev work
- aint broke, don't fix it
- serves on average at 130ms~

### preparedCheck -> Redis
- TTL
- faster than table storage
- transient data
- significantly lowers demand overall on storage account connections

### pupil prefs as a service
http function exposing GET/POST/DELETE.
has its own dedicated data store, preferably redis or table storage.
pupil-spa would need credential challenge
#### dependencies
- admin app (get/set prefs)
- pupil spa (set prefs)
- pupil api (get prefs)
#### why?
- isolates data and functionality (true microservice)
- moves demand away from SQL
#### why not?
- extra dev work
- ain't broke, don't fix it
- harder to report on
- breaks existing functionality

### pupil-login function
- existing function updates check table directly with logged in time
- existing submits pupil-status update message to queue
#### changes
- create table storage 'pupilLogin'
  - partitionKey: pupilUUID
  - rowKey: checkCode
- remove pupil-status queue
- do not update sql

Should not influence pupil status, but should serve as a support element to acknowledge when pupil logged in.
illustrates the issue of combining the pupils current status with check status.

## Decisions

### check receiver
- message is received from the check-submitted queue
  - persisted as-is in an immutable state.
  - Compressed 'large' complete check is ~24KB
- record is inserted into receivedCheck table
  - partition key: schoolUUID
  - record primary key: checkCode
  - checkData: compressed archive property value
  - dateReceived: current UTC datetime
  - dispatches message onto check-notification queue to indicate received

### check notifier
triggered by message on check-notification service bus queue.
responsible for updating mtc_admin.check with submission progress.
- notification types:
  - check-received
    - sql.mtc_admin.check.receivedByServerAt is updated to current UTC datetime
  - check-complete
    - sql.mtc_admin.check.complete set to true
    - sql.mtc_admin.check.completedAt set to current UTC datetime
  - processing-failure
    - sql.mtc_admin.check.processingFailed set to true
    - sql.mtc_admin.check.completedAt set to current UTC datetime
  - if sql operation fails or check is not found this information is recorded in sqlUpdateError column of receivedCheck record? (decision required)
  - the execution timeout of the function must take into consideration the potential for waits / retries on sql operations

### check-validator function & queue

- triggered by check-validation bus message
- properties are validated against v2 schema
- message is dispatched to check-marking queue via output binding
- failure submits message to check-notification queue

Hydrates and validates an entry in the receivedCheck table.
uses complete-check schema to validate check has same top level properties
Records 'validatedAt' in UTC against the entry on completion.
Submits a check-marking message onto the queue after recording validation datetime.
Records a 'validationError' against the entry on failure.
submits 'check-notification' message to indidate validation failure (shares same 'processing failure' outcome with check-marking function)

#### check-validation queue properties (currently service bus)
- Max size: 5GB
- TTL: 14 days
- Lock duration: 5 minutes
- Duplicate detection: enabled
- Duplicate detection window: 1 day
- Dead lettering on expiration: true
- Sessions/FIFO: false
- Partitioning: false

### check marker function & queue

  - sb message is received from check-marking queue
  - properties are validated against V1 schema (schoolid and checkCode)
  - receivedCheck entry is retrieved
  - check is marked
  - score is recorded in mark column
  - if marking fails, error details are stored in markError column and row is updated (shares same 'processing failure' outcome with check-validator function)
Further actions to be defined, but will include signalling that check is ready for PS report and MI.

#### check-marking queue properties
- Max size: 5GB
- TTL: 14 days
- Lock duration: 5 minutes
- Duplicate detection: enabled
- Duplicate detection window: 1 day
- Dead lettering on expiration: true
- Sessions/FIFO: false
- Partitioning: false
