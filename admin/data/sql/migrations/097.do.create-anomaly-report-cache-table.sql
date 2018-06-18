CREATE TABLE [mtc_admin].[anomalyReportCache] (
  id        INT IDENTITY (1, 1) NOT NULL,
  check_id  INT                 NOT NULL,
  jsonData  NVARCHAR(MAX)       NOT NULL,
  version   ROWVERSION          NOT NULL,
  createdAt DATETIMEOFFSET(3)   NOT NULL DEFAULT GETUTCDATE(),
  updatedAt DATETIMEOFFSET(3)   NOT NULL DEFAULT GETUTCDATE(),
  FOREIGN KEY (check_id) REFERENCES [mtc_admin].[check] (id),
  CONSTRAINT PK_anomalyReportCache PRIMARY KEY CLUSTERED
    (
      [id] ASC
    )
    WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      IGNORE_DUP_KEY = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON
    )
);
