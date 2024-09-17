ALTER TABLE [mtc_admin].[pupilRestart]
    ADD [deletedBy_pupilAttendance_id] INT NULL;

ALTER TABLE [mtc_admin].[pupilRestart] WITH NOCHECK
    ADD CONSTRAINT [FK_pupilRestart_pupilAttendance_deletedBy_id] FOREIGN KEY ([deletedBy_pupilAttendance_id]) REFERENCES [mtc_admin].[pupilAttendance] ([id]);

ALTER TABLE [mtc_admin].[pupilRestart] WITH CHECK CHECK CONSTRAINT [FK_pupilRestart_pupilAttendance_deletedBy_id];
