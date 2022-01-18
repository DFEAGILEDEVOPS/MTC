CREATE TABLE [mtc_admin].[schoolAudit] (
    [id] [int] IDENTITY(1,1) NOT NULL,
    [createdAt] [datetimeoffset](3) NOT NULL,
    [auditOperationTypeLookup_id] [int] NOT NULL,
    [version] [timestamp] NOT NULL,
    [newData] [nvarchar](max) NULL,
    [school_id] [int] NOT NULL,
    CONSTRAINT [PK_schoolAudit] PRIMARY KEY (id)
);

ALTER TABLE [mtc_admin].[schoolAudit]  WITH CHECK ADD CONSTRAINT [FK_school_id] FOREIGN KEY([school_id])
REFERENCES [mtc_admin].[school] ([id])

ALTER TABLE [mtc_admin].[schoolAudit]  WITH CHECK ADD CONSTRAINT [FK_auditOperationTypeLookup_id] FOREIGN KEY([auditOperationTypeLookup_id])
REFERENCES [mtc_admin].[auditOperationTypeLookup] ([id])
