--
-- Load test helper: resets common tables after a load-test
-- NB some statements should be excluded if you want to build up volume data
--

--
-- MTC RESULTS
--
TRUNCATE TABLE mtc_results.checkResultSyncError
TRUNCATE TABLE mtc_results.psychometricReport
TRUNCATE TABLE mtc_results.userInput;
--DELETE FROM mtc_results.userInputTypeLookup;
DELETE FROM  mtc_results.answer;
TRUNCATE TABLE mtc_results.event;
DELETE FROM mtc_results.userDevice;
DELETE FROM mtc_results.browserFamilyLookup
DELETE FROM mtc_results.deviceOrientationLookup
DELETE FROM mtc_results.navigatorLanguageLookup
DELETE FROM mtc_results.navigatorPlatformLookup
DELETE FROM mtc_results.networkConnectionEffectiveTypeLookup
DELETE FROM mtc_results.uaOperatingSystemLookup
DELETE FROM mtc_results.userAgentLookup
--DELETE FROM mtc_results.eventTypeLookup
DELETE FROM mtc_results.checkResult


--
-- MTC ADMIN
--
TRUNCATE TABLE mtc_admin.adminLogonEvent
TRUNCATE TABLE mtc_admin.pupilRestart
TRUNCATE TABLE mtc_admin.azureBlobFile
TRUNCATE TABLE mtc_admin.auditLog
-- user data
TRUNCATE TABLE mtc_admin.checkPin
TRUNCATE TABLE mtc_admin.checkConfig
TRUNCATE TABLE mtc_admin.pupilAccessArrangements
TRUNCATE TABLE mtc_admin.pupilAttendance
DELETE FROM mtc_admin.pupilRestart
DELETE FROM mtc_admin.[hdf]
DELETE FROM mtc_admin.[serviceMessage]
UPDATE mtc_admin.pupil SET pupilAgeReason_id=NULL, group_id=NULL, attendanceId=NULL, currentCheckId=NULL,
                           checkComplete=0, job_id=null;
DELETE FROM mtc_admin.pupilAgeReason
DELETE FROM mtc_admin.[check]
DELETE FROM mtc_admin.[job]
DELETE FROM mtc_admin.[group]
-- config
--DELETE FROM mtc_admin.[checkFormWindow]
--DELETE FROM mtc_admin.[checkForm]
--DELETE FROM mtc_admin.checkWindow
TRUNCATE TABLE mtc_admin.sce
TRUNCATE TABLE mtc_admin.settingsLog
-- DELETE FROM mtc_admin.[user]
-- DELETE FROM mtc_admin.school
-- Delete new schools uploaded without pupils
-- DELETE FROM mtc_admin.school WHERE leaCode <> 999;
