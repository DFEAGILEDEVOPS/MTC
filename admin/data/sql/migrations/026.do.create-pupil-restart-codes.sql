CREATE TABLE [mtc_admin].[pupilRestartCodes]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [rowversion],
	[code] [nvarchar](3) NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	CONSTRAINT [PK_attendanceCode] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)
