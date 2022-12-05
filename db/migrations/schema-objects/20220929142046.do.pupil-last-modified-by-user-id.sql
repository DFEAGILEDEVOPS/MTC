ALTER TABLE [mtc_admin].[pupil]
  ADD lastModifiedBy_userId INT NULL
GO

ALTER TABLE [mtc_admin].[pupil] WITH CHECK ADD CONSTRAINT [FK_pupil_lastModifiedBy_userId] FOREIGN KEY([lastModifiedBy_userId])
REFERENCES [mtc_admin].[user] ([id])
GO
