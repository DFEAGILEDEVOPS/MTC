# Check Replay Utility

Allows submitted checks from a live check window to be resubmitted and processed through the back end system.

This is useful for exercising the back end processing journey of a new build to understand how it deals with the variety of payloads that we typically see during a live check window.

##  Requirements
- A copy of the main database from a prior live check window.
- Data from the Azure Storage Table 'receivedCheck' from the same live check window.

## Setup
1. **Anonymisation:** Run the scripts in the `/deploy/sql/anonymise-sql-data/` directory against the copied SQL database.
2. **Import Submitted Checks:** Using Azure Data Factory, copy the contents of the Azure Storage Table 'receivedCheck' into the copied SQL database as `mtc_admin.receivedCheck`.
3. **Optimise:** Create a composite primary key for the `mtc_admin.receivedCheck` table from the `PartitionKey` and `RowKey` columns. TO BE TESTED
4. **Reset State:** Execute the `reset-state-pupils-checks.sql` (in this directory) against the copied SQL database.

## API Usage

The test utility APIs must be enabled via the `DevTestUtils.TestSupportApi` boolean config value.  This is set via the environment variable `TEST_SUPPORT_API_ENABLED`.

Example call, specifying individual check codes...

```
POST /api/util-replay-check HTTP/1.1
Content-Type: application/json; charset=utf-8

{"checkCodes":[
  "e34058a5-6497-4304-80f7-bf25e2ea569a",
  "e35dc478-6403-42fa-83e4-fab3fddce7a4",
  "fdc6d1e1-2b36-4018-9872-069be2c74afb",
  "00f71529-5d3f-4867-9681-8348f5d1d15f",
]}
```

Example call, specifying an entire school...

```
POST /api/util-replay-check HTTP/1.1
Content-Type: application/json; charset=utf-8

{"schoolUuid":"e34058a5-6497-4304-80f7-bf25e2ea569a"}
```
