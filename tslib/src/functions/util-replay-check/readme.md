# Check Replay Utility

Allows submitted checks from a live check window to be resubmitted and processed through the back end system.

This is useful for exercising the back end processing journey of a new build to understand how it deals with the variety of payloads that we typically see during a live check window.

##  Requirements
A copy of the main database from a prior live check window is required in order to test the system with 'real' data.  This must first be anonymised with the 
The contents of the Azure Storage Table 'receivedCheck' must be copied into the main SQL database as `mtc_admin.receivedCheck`.  This is a straightforward process via Azure Data Factory.
The `reset.sql` script must be run against the
