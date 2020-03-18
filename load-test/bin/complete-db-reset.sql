
/************************
  resets common tables after a load-test
  some statements should be excluded if you want to build up volume data
 */

TRUNCATE TABLE mtc_admin.adminLogonEvent
TRUNCATE TABLE mtc_admin.psychometricianReportCache
TRUNCATE TABLE mtc_admin.anomalyReportCache
TRUNCATE TABLE mtc_admin.pupilRestart
TRUNCATE TABLE mtc_admin.azureBlobFile
TRUNCATE TABLE mtc_admin.auditLog
-- user data
TRUNCATE TABLE mtc_admin.answer
TRUNCATE TABLE mtc_admin.checkPin
TRUNCATE TABLE mtc_admin.checkConfig
TRUNCATE TABLE mtc_admin.pupilAccessArrangements
TRUNCATE TABLE mtc_admin.pupilAttendance
DELETE FROM mtc_admin.pupilColourContrasts
DELETE FROM mtc_admin.pupilResultsDiagnosticCache
DELETE FROM mtc_admin.pupilFontSizes
DELETE FROM mtc_admin.pupilRestart
DELETE FROM mtc_admin.[hdf]
DELETE FROM mtc_admin.[schoolScore]
DELETE FROM mtc_admin.[serviceMessage]
UPDATE mtc_admin.pupil SET pupilAgeReason_id=NULL, group_id=NULL, attendanceId=NULL, currentCheckId=NULL
DELETE FROM mtc_admin.pupilAgeReason
DELETE FROM mtc_admin.[check]
DELETE FROM mtc_admin.pupil
DELETE FROM mtc_admin.[job]
DELETE FROM mtc_admin.[group]
-- config
DELETE FROM mtc_admin.[checkFormWindow]
DELETE FROM mtc_admin.[checkForm]
DELETE FROM mtc_admin.checkWindow
TRUNCATE TABLE mtc_admin.sce
TRUNCATE TABLE mtc_admin.settingsLog
DELETE FROM mtc_admin.[user]
DELETE FROM mtc_admin.school

