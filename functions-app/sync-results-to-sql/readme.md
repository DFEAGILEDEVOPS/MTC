# sync-results-to-sql

This function copies marking data stored in Table Service back to the SQL Server DB.  It runs out-of-hours from a
TimerTrigger. 

## Implementation

Source: Table Storage: `checkResult` table
Destination: SQL Server DB: `checkScore`, `answer` tables

Checks that need marking data are defined as those that have `check.complete` set to `true` but do not have a
corresponding score in `checkScore`.  In order to get the function to re-process a particular check you would need to
delete the corresponding rows in `checkScore` and `answer` and wait for the next invocation.


