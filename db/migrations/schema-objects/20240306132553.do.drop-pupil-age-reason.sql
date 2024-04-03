ALTER TABLE[mtc_admin].[pupil] DROP CONSTRAINT IF EXISTS [FK_pupil_pupilAgeReason_id];
ALTER TABLE [mtc_admin].[pupil] DROP COLUMN IF EXISTS  [pupilAgeReason_id];
DROP TABLE IF EXISTS [mtc_admin].[pupilAgeReason];
