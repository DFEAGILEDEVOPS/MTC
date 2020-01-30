
truncate table mtc_admin.psychometricianReportCache
truncate table mtc_admin.pupilRestart
UPDATE mtc_admin.pupil SET checkComplete=0, currentCheckId=NULL
truncate table mtc_admin.checkPin
truncate table mtc_admin.checkConfig
DELETE FROM mtc_admin.[check]
truncate table mtc_admin.auditLog
truncate table mtc_admin.pupilAccessArrangements
DELETE FROM mtc_admin.pupilAgeReason
truncate table mtc_admin.pupilAttendance
DELETE FROM mtc_admin.pupilColourContrasts
DELETE FROM mtc_admin.pupilFontSizes
DELETE FROM mtc_admin.[group]
