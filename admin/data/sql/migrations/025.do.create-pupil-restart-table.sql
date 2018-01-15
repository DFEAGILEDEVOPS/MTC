CREATE TABLE [mtc_admin].[pupilRestart]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [rowversion],
	[reason] [nvarchar](50) NOT NULL,
	[didNotCompleteInformation] [nvarchar](max) NULL,
	[furtherInformation] [nvarchar](max) NULL,
	[isDeleted] [bit] NOT NULL DEFAULT FALSE,
	[deletedByUser] [nvarchar](50) NULL,
	[deletedAt] [datetimeoffset](3) NULL,
	CONSTRAINT [PK_attendanceCode] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)