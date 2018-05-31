ALTER TABLE [mtc_admin].[job] DROP CONSTRAINT FK_job_jobStatus_code
ALTER TABLE [mtc_admin].[job] DROP CONSTRAINT FK_job_jobType_code
DROP TABLE [mtc_admin].[job];
