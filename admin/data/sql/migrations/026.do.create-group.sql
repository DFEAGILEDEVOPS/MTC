CREATE TABLE [mtc_admin].[group]
(
  [id] [int] IDENTITY(1,1) NOT NULL,
  [name] [nvarchar](max) NOT NULL,
  [isDeleted] [bit] NOT NULL DEFAULT 0,
  [createdAt] [datetimeoffset](3) NOT NULL DEFAULT GETUTCDATE(),
  [updatedAt] [datetimeoffset](3) NOT NULL DEFAULT GETUTCDATE(),
  PRIMARY KEY CLUSTERED
  (
	  [id] ASC
  ) WITH (
    PAD_INDEX = OFF,
    STATISTICS_NORECOMPUTE = OFF,
    IGNORE_DUP_KEY = OFF,
    ALLOW_ROW_LOCKS = ON,
    ALLOW_PAGE_LOCKS = ON
  )
)
