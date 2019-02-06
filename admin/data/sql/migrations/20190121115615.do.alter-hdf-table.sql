ALTER TABLE [mtc_admin].[hdf] DROP COLUMN declaration;
ALTER TABLE [mtc_admin].[hdf] ADD confirmed bit NOT NULL;
ALTER TABLE [mtc_admin].[hdf] ADD headTeacher bit NOT NULL;