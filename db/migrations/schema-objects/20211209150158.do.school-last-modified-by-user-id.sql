ALTER TABLE [mtc_admin].[school]
  ADD lastModifiedBy_userId INT NULL
GO

ALTER TABLE [mtc_admin].[school] WITH CHECK ADD CONSTRAINT [FK_school_lastModifiedBy_userId] FOREIGN KEY([lastModifiedBy_userId])
REFERENCES [mtc_admin].[user] ([id])
GO
