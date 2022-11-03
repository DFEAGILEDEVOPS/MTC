CREATE TABLE [mtc_admin].[pupilAudit] (
    [id] [int] IDENTITY(1,1) NOT NULL,
    [createdAt] [datetimeoffset](3) NOT NULL,
    [auditOperationTypeLookup_id] [int] NOT NULL,
    [version] [timestamp] NOT NULL,
    [newData] [nvarchar](max) NOT NULL,
    [pupil_id] [int] NOT NULL,
    [operationBy_userId] [int] NULL,
    [sqlUserIdentifier] [nvarchar](max) NOT NULL,
    CONSTRAINT [PK_pupilAudit] PRIMARY KEY (id)
);

ALTER TABLE [mtc_admin].[pupilAudit] WITH CHECK ADD CONSTRAINT [FK_pupilAudit_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [mtc_admin].[pupil] ([id])

ALTER TABLE [mtc_admin].[pupilAudit] WITH CHECK ADD CONSTRAINT [FK_pupilAudit_operationBy_userId] FOREIGN KEY([operationBy_userId])
REFERENCES [mtc_admin].[user] ([id])

ALTER TABLE [mtc_admin].[pupilAudit] WITH CHECK ADD CONSTRAINT [FK_pupilAudit_auditOperationTypeLookup_id] FOREIGN KEY([auditOperationTypeLookup_id])
REFERENCES [mtc_admin].[auditOperationTypeLookup] ([id])

ALTER TABLE [mtc_admin].[pupilAudit] ADD DEFAULT (getutcdate()) FOR [createdAt]
