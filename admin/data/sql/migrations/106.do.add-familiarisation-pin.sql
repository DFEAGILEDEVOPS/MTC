ALTER TABLE [mtc_admin].[pupil] ADD familiarisation_pin NVARCHAR(12) NULL
ALTER TABLE [mtc_admin].[pupil] ADD familiarisation_pinExpiresAt [datetimeoffset](3) NULL
ALTER TABLE [mtc_admin].[check] ADD is_familiarisation smallint NOT NULL DEFAULT 1
