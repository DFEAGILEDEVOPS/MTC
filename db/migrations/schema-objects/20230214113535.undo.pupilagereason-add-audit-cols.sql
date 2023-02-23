ALTER TABLE [mtc_admin].[pupilAgeReason] DROP CONSTRAINT IF EXISTS [DF_createdAt], [DF_updatedAt];
ALTER TABLE [mtc_admin].[pupilAgeReason] DROP COLUMN IF EXISTS  [updatedAt], COLUMN IF EXISTS [createdAt];
