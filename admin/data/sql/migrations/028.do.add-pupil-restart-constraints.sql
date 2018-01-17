ALTER TABLE [mtc_admin].[pupilRestart] WITH CHECK ADD CONSTRAINT [FK_pupilRestart_pupilRestartCode_id] FOREIGN KEY([pupilRestartCode_id])
REFERENCES [mtc_admin].[pupilRestartCode] ([id])

ALTER TABLE [mtc_admin].[pupilRestart] WITH CHECK ADD CONSTRAINT [FK_pupilRestart_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [mtc_admin].[pupil] ([id])

ALTER TABLE [mtc_admin].[pupilRestart] WITH CHECK ADD CONSTRAINT [FK_pupilRestart_recordedByUser_id] FOREIGN KEY([recordedByUser_id])
REFERENCES [mtc_admin].[user] ([id])

ALTER TABLE [mtc_admin].[pupilRestart] WITH CHECK ADD CONSTRAINT [FK_pupilRestart_deletedByUser_id] FOREIGN KEY([deletedByUser_id])
REFERENCES [mtc_admin].[user] ([id])
