# Sync results initialisation

This function runs from nightly timer trigger and will find all unsynchronised live checks and put a message
per check on the check-completion queue.

This function is run as a throttled function and MUST run as a singleton.  Duplicate message detection should
be enabled on the `check-completion` queue and is supported by the `messageId` which is set to the `checkCode`.

This function kicks off the results synchronisation from the Azure Storage tables to the SQL Database.

## Inputs

* timer
* The marked check in table-storage from the `checkResult` table
* The received check in table-storage from the `receivedCheck` table

## Outputs

* One message to the service bus queue `check-completion` per check to sync

## Data copied

* n/a

## Data transformed

* none

## Error handling

* This function is self-correcting in the sense that if a message is not put on the queue it will logged and
  re-attmpted on the next run.  If the actual sync function fails than the `syncProcessed` flag will not be set and
  synchronisation will be reattempted.

  At any point synchronisation can be re-run - idempotently.

## Consumers

* Data Team

## Timing

Once per day

## Notes

See the [architecture diagram:](../docs/diagrams/psychometric-report-generation.png)
