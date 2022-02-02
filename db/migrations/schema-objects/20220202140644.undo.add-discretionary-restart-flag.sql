ALTER TABLE [mtc_admin].[pupil]
DROP CONSTRAINT IF EXISTS [DF_isDiscretionaryRestartAvailable]
;

GO

ALTER TABLE [mtc_admin].[pupil]
DROP COLUMN IF EXISTS [isDiscretionaryRestartAvailable]
;
