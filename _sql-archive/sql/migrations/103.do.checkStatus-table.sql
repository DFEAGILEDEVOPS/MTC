
CREATE TABLE [mtc_admin].[checkStatus](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [rowversion] NOT NULL,
	[description] [nvarchar](50) NOT NULL,
	[code] [char](3) NOT NULL,
 CONSTRAINT [PK_checkStatus] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
 CONSTRAINT [checkStatus_code_uindex] UNIQUE NONCLUSTERED 
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [mtc_admin].[checkStatus] ADD  DEFAULT (getutcdate()) FOR [createdAt]
ALTER TABLE [mtc_admin].[checkStatus] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
