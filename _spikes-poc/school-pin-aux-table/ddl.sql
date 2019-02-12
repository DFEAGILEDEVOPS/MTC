DROP TABLE IF EXISTS [mtc_admin].[schoolPin];

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
);

Drop INDEX IF EXISTS mtc_admin.school.school_pin_uindex;

ALTER TABLE [mtc_admin].[school] drop column pin;

ALTER TABLE [mtc_admin].[school] add schoolPin_id int NULL
  CONSTRAINT FK_school_schoolPin_id_schoolPin_id FOREIGN KEY REFERENCES [mtc_admin].[schoolPin](id)
Go

CREATE UNIQUE NONCLUSTERED INDEX [IX_school_schoolPin_id_unique]
  ON [mtc_admin].[school] (schoolPin_id)
  WHERE schoolPin_id IS NOT NULL;
GO




