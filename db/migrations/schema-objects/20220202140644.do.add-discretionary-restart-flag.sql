ALTER TABLE [mtc_admin].[pupil]
ADD isDiscretionaryRestartAvailable BIT
CONSTRAINT [DF_isDiscretionaryRestartAvailable] DEFAULT 0 NOT NULL
;
