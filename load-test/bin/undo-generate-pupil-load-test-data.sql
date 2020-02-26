
/************************
  resets common tables after a load-test
  some statements should be excluded if you want to build up volume data
 */
truncate table mtc_admin.adminLogonEvent
truncate table mtc_admin.psychometricianReportCache
truncate table mtc_admin.pupilRestart
UPDATE mtc_admin.pupil SET checkComplete=0, currentCheckId=NULL
truncate table mtc_admin.checkPin
truncate table mtc_admin.checkConfig
-- disable the next line for data volume testing
DELETE FROM mtc_admin.[check]
truncate table mtc_admin.auditLog

truncate table mtc_admin.pupilAccessArrangements
truncate table mtc_admin.pupilAttendance
DELETE FROM mtc_admin.pupilAgeReason
DELETE FROM mtc_admin.pupilColourContrasts
DELETE FROM mtc_admin.pupilFontSizes
DELETE FROM mtc_admin.[group]

