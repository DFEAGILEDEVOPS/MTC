create table [mtc_admin].[schoolPin]
(
  [id]        [int] IDENTITY (1,1) NOT NULL,
  [createdAt] [datetimeoffset](3)  NOT NULL DEFAULT GETUTCDATE(),
  [updatedAt] [datetimeoffset](3)  NOT NULL DEFAULT GETUTCDATE(),
  [version]   [rowversion],
  [schoolPin] [nvarchar](12)       NULL
    CONSTRAINT [IX_schoolpin_schoolpin_unique] UNIQUE (schoolPin),
  CONSTRAINT [PK_schoolPin] PRIMARY KEY CLUSTERED ([id] ASC)
    WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)
;