
CREATE TABLE [mtc_admin].[giasStaging](
	[id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[createdAt] [datetimeoffset](3) NOT NULL DEFAULT GETUTCDATE(),
	[updatedAt] [datetimeoffset](3) NOT NULL DEFAULT GETUTCDATE(),
	[version] [timestamp] NOT NULL,
	[leaCode] [int] NULL,
	[estabCode] [nvarchar](max) NULL,
	[urn] [int] NOT NULL,
	[dfeNumber] [int] NOT NULL,
	[name] [nvarchar](max) NOT NULL
)
