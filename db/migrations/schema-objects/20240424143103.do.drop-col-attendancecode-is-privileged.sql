ALTER TABLE [mtc_admin].[attendanceCode] DROP CONSTRAINT IF EXISTS [DF_isPrivileged];

ALTER TABLE [mtc_admin].[attendanceCode] DROP COLUMN IF EXISTS  [isPrivileged];
