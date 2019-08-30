# Design proposals for 2020 architecture

## Next steps

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

## Restarts

Map the restart record to the last check taken, rather than wait for the next check to be created.  This gives a clear indication of checks that are void, due to a restart.
Analysis session on restarts required to inform decisions

## pupil-login function
- updates check table directly with logged in time
- submits pupil-status update message to queue

Should not influence pupil status, but should serve as a support element to acknowledge when pupil logged in.
illustrates the issue of combining the pupils current status with check status.
record in separate append only storage table for support use.  this will relieve pressure on pupil status situation.

## check-validator function & queue

triggered by a new message on the check-validation service bus queue.
Hydrates and validates an entry in the receivedCheck table.
Records 'validatedAt' in UTC against the entry on completion.
Submits a check-marking message onto the queue after recording validation datetime.
Records a 'validationError' against the entry on failure.

### check-validation queue properties (currently service bus)
- Max size: 1GB (to be reviewed)
- TTL: 14 days
- Lock duration: 5 minutes
- Duplicate detection: enabled
- Duplicate detection window: 1 day
- Dead lettering on expiration: true
- Sessions/FIFO: false
- Partitioning: false

## check marking function & queue

triggered by a new message on the check-marking service bus queue.
Hydrates and marks an entry in the receivedCheck table.
records 'mark' against the entry on completion.
Further actions to be defined, but will include signalling that check is ready for PS report and MI.

### check-marking queue properties
- Max size: 1GB (to be reviewed)
- TTL: 14 days
- Lock duration: 5 minutes
- Duplicate detection: enabled
- Duplicate detection window: 1 day
- Dead lettering on expiration: true
- Sessions/FIFO: false
- Partitioning: false

## check-started function

implement version construct as per other functions
Q: restarts depend on a check-started being received - is this brittle?
Q: how could we record check-started in a non status related way? separate db / microservice?

## completed-checks function

does way too much.
persist straight off the queue into table storage? - partitionKey: school id(uuid) rowKey: checkCode
extract marking to separate service.  consider where it stores marks to avoid too many sql connections
consider redis for transient status lookups
should we have a bit flag on the check table, that we can set when check received.  this would be a low cost solution to maintaining 'checks not received yet' for teachers.
expiry flag would help with distinction on whether some havent been received in time, or whether we can still wait.
how do we deal with multiple processing of a complete check?

### storage options for received checks

Preference is to store the message as-is in an immutable state. CheckCode and SchoolUUID will be top level properties to use as composite key.
Compressed 'large' complete check is ~24KB

#### Table Storage (classic)
- max property length of 32KB
- high performance
- low cost
- partition and row key fit well with school ID & check code

#### Cosmos SQL API
- Key/Value JSON store
- supports function bindings
- cost: TBC
- scale: TBC
- 'basic' container has a 10GB storage capacity and throughput of 400 request units per second, costing $0.033 USD per hour.
- supports multiple indexes
- 👎🏼 hard upper limit based on configured scale

#### BLOB Storage
- container per school, named by school UUID
- check persisted as `{checkCode}.json`
- cheap
- 👎🏼 no function bindings
- 👎🏼 complicated pricing (storage size, I/O rates, storage term)
 - 👎🏼 'dumb' container / no query functionality other than school UUID & checkCode

#### SQL Server
- managing schema / migrations
- effectively stores JSON as a blob
- 👎🏼 potentially expensive
- 👎🏼 no function bindings
- 👎🏼 hard upper limit based on configured scale


### revised journey

- check receiver function:
  - message is received from the complete-check queue
  - properties are validated against v2 schema
  - message is decompressed to reveal JSON payload
  - school UUID is extracted to provide partition key
  - checkCode is extracted to provide row key
  - record is inserted into receivedCheck table (cosmos-sql / cosmos-mongo / sqlAzure)
    - partition key: schoolUUID
    - record primary key: checkCode
    - checkData: (sqlAzure only) decompressed archive property value.  cosmos supports JSON objects natively.
    - dateReceived: current UTC datetime
  - sql.mtc_admin.check.receivedByServerAt is updated to current UTC datetime
    - if update fails or check is not found this information is recorded in sqlUpdateError column of receivedCheck record
    - the execution timeout of the function must take into consideration the potential for waits on the storage operations
- check validator function:
  - insertion of entry into receivedCheck triggers input binding
  - properties of JSON payload are checked to ensure schema is correct
  - message is dispatched to unmarked-check queue via output binding
- check marker function:
  - message is received from unmarked-check queue
  - properties are validated against V1 schema (schoolid and checkCode)
  - receivedCheck entry is retrieved
  - check is marked
  - score is recorded in mark column
  - row is updated in receivedCheck table
  - if marking fails, error details are stored in markError column and row is updated

## expire-prepared-checks function

redis & cosmos table API support TTL on rows.  This would be a much cleaner implementation.

## check-expiry function

potential query optimisation to have better way to flag the expiry of the restart.

## census-import

move to functions-app as long running, and upload file direct to BLOB storage which triggers function.
