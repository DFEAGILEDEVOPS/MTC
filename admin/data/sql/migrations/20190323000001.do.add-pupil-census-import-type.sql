CREATE TYPE [mtc_census_import].censusImportTableType AS TABLE
  (
    id          INT,
    lea         NVARCHAR(MAX),
    estab       NVARCHAR(MAX),
    upn         NVARCHAR(MAX),
    forename    NVARCHAR(MAX),
    surname     NVARCHAR(MAX),
    middlenames NVARCHAR(MAX),
    gender      NVARCHAR(MAX),
    dob         NVARCHAR(MAX)
  );
