-- UNDO add column
 ALTER TABLE [mtc_admin].[school]
    DROP CONSTRAINT IF EXISTS [DF_isTestSchool];
go

ALTER TABLE [mtc_admin].[school] DROP COLUMN IF EXISTS  [isTestSchool];
