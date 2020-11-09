ALTER TABLE [mtc_admin].[pupil] DROP CONSTRAINT FK_pupil_job_id
ALTER TABLE [mtc_admin].[job] DROP CONSTRAINT PK_job_id
ALTER TABLE [mtc_admin].[pupil] DROP COLUMN job_id;
