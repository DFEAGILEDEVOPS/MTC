ALTER TABLE [mtc_admin].[pupil] DROP CONSTRAINT FK_pupil_pupilAgeReason_id
ALTER TABLE [mtc_admin].[pupil] DROP COLUMN pupilAgeReason_id

ALTER TABLE [mtc_admin].[pupilAgeReason] DROP CONSTRAINT FK_pupilAgeReason_pupil_id
DROP TABLE [mtc_admin].[pupilAgeReason]
