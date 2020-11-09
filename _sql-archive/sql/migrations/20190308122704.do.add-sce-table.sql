CREATE TABLE [mtc_admin].[sce] (
  id int IDENTITY (1,1) NOT NULL,
  createdAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  updatedAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  version rowversion,
  school_id int NOT NULL,
  timezone nvarchar(200) NOT NULL,
  isOpen bit NOT NULL,
  CONSTRAINT [PK_sce] PRIMARY KEY CLUSTERED ([id] ASC)
  WITH (
    PAD_INDEX = OFF,
    STATISTICS_NORECOMPUTE = OFF,
    IGNORE_DUP_KEY = OFF,
    ALLOW_ROW_LOCKS = ON,
    ALLOW_PAGE_LOCKS = ON
  )
)

ALTER TABLE [mtc_admin].[sce] WITH CHECK ADD CONSTRAINT [FK_sce_school_id] FOREIGN KEY([school_id])
REFERENCES [mtc_admin].[school] ([id])
