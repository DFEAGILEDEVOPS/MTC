/*
resets check window, pupils and checks ready to be resubmitted via the receivedCheck table.
NOTE: this is only possible with a database from a closed check window with a copy of the receivedCheck azure storage table imported into mtc_admin.receivedCheck

we do not need to consider any actions that take place before submitting check.  this is just about check submission and backend processing
*/

-- Fast fail if receivedCheck table not present
SELECT COUNT(*) FROM mtc_admin.receivedCheck

-- update check window to encapsulate today
UPDATE mtc_admin.checkWindow SET
        adminStartDate=@yesterday,
        checkStartDate=@yesterday,
        checkEndDate=@oneMonthFromToday,
        familiarisationCheckStartDate=@yesterday,
        familiarisationCheckEndDate=@oneMonthFromToday
WHERE name='MTC_live_2021'
-- remove any restarts?????

-- set pupil to incomplete etc

-- set check to incomplete and dates to today

-- update school pin to today

