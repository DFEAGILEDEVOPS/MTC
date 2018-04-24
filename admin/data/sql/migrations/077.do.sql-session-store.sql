CREATE TABLE [mtc_admin].[sessions](
  [sid] varchar(255) NOT NULL
    CONSTRAINT [pk_sessions] PRIMARY KEY CLUSTERED ([sid] ASC),
  [expires] datetimeoffset NOT NULL,
  [sess] nvarchar(MAX) NULL
)
