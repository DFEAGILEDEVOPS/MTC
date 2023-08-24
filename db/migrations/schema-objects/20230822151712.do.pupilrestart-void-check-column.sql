ALTER TABLE [mtc_admin].[pupilRestart]
    ADD [voidCheck_id] INT NOT NULL;

ALTER TABLE [mtc_admin].[pupilRestart] WITH NOCHECK
    ADD CONSTRAINT [FK_pupilRestart_check_voidCheck_id] FOREIGN KEY ([voidCheck_id]) REFERENCES [mtc_admin].[check] ([id]);
