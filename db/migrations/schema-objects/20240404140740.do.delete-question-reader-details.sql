ALTER TABLE [mtc_admin].[pupilAccessArrangements] DROP CONSTRAINT IF EXISTS [FK_pupilAccessArrangements_questionReaderReasons_id];
GO

DROP INDEX IF EXISTS [mtc_admin].[pupilAccessArrangements].[pupilAccessArrangements_questionReaderReasons_id_index];
GO

DROP TABLE IF EXISTS [mtc_admin].[questionReaderReasons];
GO

ALTER TABLE [mtc_admin].[pupilAccessArrangements] DROP COLUMN IF EXISTS  [questionReaderReasons_id], COLUMN IF EXISTS [questionReaderOtherInformation];
