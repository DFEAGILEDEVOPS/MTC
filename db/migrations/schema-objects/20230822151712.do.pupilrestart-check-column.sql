ALTER TABLE [mtc_admin].[pupilRestart]
    ADD [check_id] INT NOT NULL;

ALTER TABLE [mtc_admin].[pupilRestart] WITH NOCHECK
    ADD CONSTRAINT [FK_pupilRestart_check] FOREIGN KEY ([check_id]) REFERENCES [mtc_admin].[check] ([id]);
