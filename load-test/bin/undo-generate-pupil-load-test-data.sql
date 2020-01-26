
UPDATE mtc_admin.school SET pin=NULL
DELETE FROM mtc_admin.psychometricianReportCache
DELETE FROM mtc_admin.pupilRestart
DELETE FROM mtc_admin.[checkPin]
DELETE FROM mtc_admin.answer
UPDATE mtc_admin.pupil SET checkComplete=0, currentCheckId=NULL
DELETE FROM mtc_admin.[checkConfig]
DELETE FROM mtc_admin.[check]
DELETE FROM mtc_admin.auditLog
DELETE FROM mtc_admin.pupilAccessArrangements
DELETE FROM mtc_admin.pupilAgeReason
DELETE FROM mtc_admin.pupilAttendance
DELETE FROM mtc_admin.pupilColourContrasts
DELETE FROM mtc_admin.pupilFontSizes
DELETE FROM mtc_admin.[group]
