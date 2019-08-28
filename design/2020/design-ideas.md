# Design proposals for 2020 architecture

### Next steps

#### Analysis day 27th Aug 2019
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

### Restarts

Map the restart record to the last check taken, rather than wait for the next check to be created.  This gives a clear indication of checks that are void, due to a restart.
Analysis session on restarts required to inform decisions

### pupil-login function
- updates check table directly with logged in time
- submits pupil-status update message to queue

Should not influence pupil status, but should serve as a support element to acknowledge when pupil logged in.
illustrates the issue of combining the pupils current status with check status.
record in separate append only storage table for support use.  this will relieve pressure on pupil status situation.

### check-started function

implement version construct as per other functions
Q: restarts depend on a check-started being received - is this brittle?
Q: how could we record check-started in a non status related way? separate db / microservice?

### completed-checks function

does way too much.
persist straight off the queue into table storage? - partitionKey: school id(uuid) rowKey: checkCode
extract marking to separate service.  consider where it stores marks to avoid too many sql connections
consider redis for transient status lookups
should we have a bit flag on the check table, that we can set when check received.  this would be a low cost solution to maintaining 'checks not received yet' for teachers.
expiry flag would help with distinction on whether some havent been received in time, or whether we can still wait.

#### revised journey

- check receiver function:
  - message is received from the complete-check queue
  - properties are validated against v2 schema
  - message is decompressed to reveal JSON payload
  - school id is extracted to provide partition and row keys of schoolid and check code respectively.
  - record is inserted into receivedCheck table
    - partitionKey: schoolid
    - rowKey: checkCode
    - checkData: decompressed archive property value
    - dateReceived: current UTC datetime
  - sql.mtc_admin.check.receivedByServerAt is updated to current UTC datetime
    - if update fails or check is not found this information is recorded in sqlUpdateError column of receivedCheck record
    - the execution timeout of the function must take into consideration the potential for waits on the sql insert
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

### expire-prepared-checks function

redis & cosmos table API support TTL on rows.  This would be a much cleaner implementation.

### check-expiry function

potential query optimisation to have better way to flag the expiry of the restart.

### census-import

move to functions-app as long running, and upload file direct to BLOB storage which triggers function.
