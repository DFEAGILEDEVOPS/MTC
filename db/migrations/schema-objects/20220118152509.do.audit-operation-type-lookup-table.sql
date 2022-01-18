CREATE TABLE [mtc_admin].[auditOperationTypeLookup](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[auditOperation] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_auditOperationTypeLookup] PRIMARY KEY (id)
);

ALTER TABLE [mtc_admin].[auditOperationTypeLookup] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[auditOperationTypeLookup] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
