CREATE TABLE [mtc_admin].[pupilGroup]
(
  [id] [int] IDENTITY(1,1) NOT NULL,
  [group_id] INT NOT NULL,
  [createdAt] [datetimeoffset](3) NOT NULL DEFAULT GETUTCDATE(),
  [updatedAt] [datetimeoffset](3) NOT NULL DEFAULT GETUTCDATE(),
  FOREIGN KEY (group_id) REFERENCES [mtc_admin].[group] (id),
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

