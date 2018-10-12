-- create a pin table
DROP TABLE IF EXISTS [mtc_admin].[pin];
create table [mtc_admin].[pin] (
  [id] [int] IDENTITY(1,1) NOT NULL,
  [createdAt] [datetimeoffset](3) NOT NULL
    CONSTRAINT[DF_pin_created_at] DEFAULT CURRENT_TIMESTAMP,
  [updatedAt] [datetimeoffset](3) NOT NULL
    CONSTRAINT [DF_pin_updated_at] DEFAULT CURRENT_TIMESTAMP,
  [version] [rowversion],
  [val] [int] NULL
    CONSTRAINT [IX_pin_val_unique] UNIQUE(val),
  CONSTRAINT [PK_pin] PRIMARY KEY CLUSTERED ([id] ASC)
    WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
);
