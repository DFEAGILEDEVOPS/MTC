SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[schoolAudit](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[school_id] [int] NOT NULL,
	[oldData] [nvarchar](max) NOT NULL,
	[newData] [nvarchar](max) NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [mtc_admin].[schoolAudit] ADD  CONSTRAINT [PK_schoolAudit] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

ALTER TABLE [mtc_admin].[schoolAudit]  WITH CHECK ADD  CONSTRAINT [FK_schoolAudit_school_id] FOREIGN KEY([school_id])
REFERENCES [mtc_admin].[school] ([id])
GO

ALTER TABLE [mtc_admin].[schoolAudit] ADD  CONSTRAINT [DF_schoolAudit_createdAt_default]  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[schoolAudit] ADD  CONSTRAINT [DF_schoolAudit_updatedAt_default]  DEFAULT (getutcdate()) FOR [updatedAt]
GO
