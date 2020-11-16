create table [mtc_admin].[pupilStatus] (
  id int IDENTITY (1,1) NOT NULL,
  createdAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  updatedAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  version rowversion,
  description nvarchar(150) NOT NULL,
  code nvarchar(12) NOT NULL
  CONSTRAINT [PK_pupilStatus] PRIMARY KEY CLUSTERED ([id] ASC)
    WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      IGNORE_DUP_KEY = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON
    ),
  CONSTRAINT [pupilStatus_code_uindex] UNIQUE([code])
);

-- missing triggers like a lot of newer tables
