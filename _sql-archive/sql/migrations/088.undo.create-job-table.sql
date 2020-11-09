ALTER TABLE [mtc_admin].[job] DROP CONSTRAINT FK_job_jobStatus_id;

ALTER TABLE [mtc_admin].[job] DROP CONSTRAINT FK_job_jobType_id;

DROP TABLE [mtc_admin].[job];