ALTER TABLE [mtc_admin].[attendanceCode] DROP CONSTRAINT IF EXISTS [DF_attendanceCode_visible_default];
ALTER TABLE [mtc_admin].[attendanceCode] DROP COLUMN IF EXISTS [visible];
