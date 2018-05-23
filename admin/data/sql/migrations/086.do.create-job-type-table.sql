CREATE TABLE [mtc_admin].[jobType] (
  id int IDENTITY (1,1) NOT NULL,
  createdAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  updatedAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  version rowversion,
  description nvarchar(50) NOT NULL,
  [code] char(3) NOT NULL,
  CONSTRAINT [PK_jobTypeCode] PRIMARY KEY CLUSTERED ([id] ASC)
    WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      IGNORE_DUP_KEY = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON
    ),
  CONSTRAINT [jobType_code_uindex] UNIQUE([code])
)
