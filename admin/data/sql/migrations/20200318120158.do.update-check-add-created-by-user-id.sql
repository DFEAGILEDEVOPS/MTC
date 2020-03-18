ALTER TABLE [mtc_admin].[check]
ADD createdBy_userId INT NOT NULL
CONSTRAINT [FK_check_createdBy_userId_fk] FOREIGN KEY([createdBy_userId])
REFERENCES [mtc_admin].[user] ([id])
