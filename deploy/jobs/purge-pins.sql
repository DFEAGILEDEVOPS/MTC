-- purge pins for non test accounts
UPDATE [mtc_admin].[pupil] SET pin=NULL, pinExpiresAt=NULL WHERE isTestAccount=0 AND pinExpiresAt <= GETUTCDATE()
-- purge pins for non test schools
UPDATE [mtc_admin].[school] SET pin=NULL, pinExpiresAt=NULL WHERE dfeNumber <> 9991999 AND pinExpiresAt <= GETUTCDATE()