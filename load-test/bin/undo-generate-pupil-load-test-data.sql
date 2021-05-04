
/************************
  resets common tables after a load-test
  some statements should be excluded if you want to build up volume data
 */
TRUNCATE TABLE mtc_admin.adminLogonEvent
TRUNCATE TABLE mtc_results.psychometricReport
TRUNCATE TABLE mtc_admin.pupilRestart
UPDATE mtc_admin.pupil SET checkComplete=0, currentCheckId=NULL
TRUNCATE TABLE mtc_admin.checkPin
TRUNCATE TABLE mtc_admin.checkConfig
-- disable the next line for data volume testing
DELETE FROM mtc_admin.[check]
TRUNCATE TABLE mtc_admin.auditLog

TRUNCATE TABLE mtc_admin.pupilAccessArrangements
TRUNCATE TABLE mtc_admin.pupilAttendance
DELETE FROM mtc_admin.pupilAgeReason
DELETE FROM mtc_admin.[group]

