
DELETE FROM mtc_admin.pupilLogonEvent
UPDATE mtc_admin.school SET pin=NULL
DELETE FROM mtc_admin.psychometricianReportCache
DELETE FROM mtc_admin.checkResult
DELETE FROM mtc_admin.pupilRestart
DELETE FROM mtc_admin.[checkPin]
DELETE FROM mtc_admin.answer
DELETE FROM mtc_admin.[check]
DELETE FROM mtc_admin.sessions
DELETE FROM mtc_admin.auditLog
UPDATE mtc_admin.pupil SET pupilStatus_id = 1
DELETE FROM mtc_admin.pupilAccessArrangements
DELETE FROM mtc_admin.pupilAgeReason
DELETE FROM mtc_admin.pupilAttendance
DELETE FROM mtc_admin.pupilColourContrasts
DELETE FROM mtc_admin.pupilFontSizes
DELETE FROM mtc_admin.pupilGroup
DELETE FROM mtc_admin.[group] 
