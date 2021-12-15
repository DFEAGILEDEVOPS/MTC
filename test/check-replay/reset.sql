/*
resets check window, pupils and checks ready to be resubmitted via the receivedCheck table.
NOTE: this is only possible with a database from a closed check window with a copy of the receivedCheck azure storage table imported into mtc_admin.receivedCheck

we do not need to consider any actions that take place before submitting check.  this is just about check submission and backend processing
*/

-- Fast fail if receivedCheck table not present
SELECT COUNT(*) FROM mtc_admin.receivedCheck

DECLARE @yesterday DATETIME2 = DATEADD(day, -1, GETDATE())
DECLARE @oneMonthFromToday DATETIME2 = DATEADD(month, 1, GETDATE())

-- update check window to encapsulate today
UPDATE mtc_admin.checkWindow SET
    adminStartDate=@yesterday,
    checkStartDate=@yesterday,
    checkEndDate=@oneMonthFromToday,
    familiarisationCheckStartDate=@yesterday,
    familiarisationCheckEndDate=@oneMonthFromToday
WHERE
    name='MTC_live_2021'

-- set pupil to incomplete etc
UPDATE mtc_admin.school SET
    checkComplete=0
WHERE
    attendanceId IS NULL
    AND checkComplete = 1

-- set check to incomplete and dates to today
UPDATE mtc_admin.[check] SET
    checkStatus_id=1,
    received=0,
    complete=0,
    completedAt=NULL,
    processingFailed=0,
    resultsSynchronised=0
WHERE
    checkStatus_id IN (2, 3, 4) -- complete, collected and not received
    AND isLiveCheck=1
    AND id IN (SELECT currentCheckId FROM mtc_admin.pupil)
