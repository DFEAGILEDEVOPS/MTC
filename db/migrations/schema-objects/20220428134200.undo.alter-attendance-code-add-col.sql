ALTER TABLE [mtc_admin].[attendanceCode] DROP CONSTRAINT IF EXISTS [DF_isPrivileged]
;
GO
ALTER TABLE [mtc_admin].[attendanceCode] DROP COLUMN IF EXISTS  [isPrivileged]
;
