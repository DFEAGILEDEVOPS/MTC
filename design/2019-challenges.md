
## Notes on 2019 Solution

## completed-checks function (DONE)
does way too much.
persist straight off the queue into table storage? - partitionKey: school id(uuid) rowKey: checkCode
extract marking to separate service.  consider where it stores marks to avoid too many sql connections
consider redis for transient status lookups
should we have a bit flag on the check table, that we can set when check received.  this would be a low cost solution to maintaining 'checks not received yet' for teachers.
expiry flag would help with distinction on whether some havent been received in time, or whether we can still wait.
how do we deal with multiple processing of a complete check?

## expire-prepared-checks function

redis & cosmos table API support TTL on rows.  This would be a much cleaner implementation.
- still using table storage.  test expiry time on 2mil prepared checks

## check-expiry function

potential query optimisation to have better way to flag the expiry of the restart.

## census-import

move to functions-app as long running, and upload file direct to BLOB storage which triggers function.

## check-started function

To be retired
implement version construct as per other functions
Q: restarts depend on a check-started being received - is this brittle? Yes, restarts no longer depend on this.
Q: how could we record check-started in a non status related way? separate db / microservice?
