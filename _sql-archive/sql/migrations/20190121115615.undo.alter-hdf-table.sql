ALTER TABLE [mtc_admin].[hdf] ADD declaration NVARCHAR(max) NOT NULL;
ALTER TABLE [mtc_admin].[hdf] DROP COLUMN confirmed;
ALTER TABLE [mtc_admin].[hdf] DROP COLUMN headTeacher;