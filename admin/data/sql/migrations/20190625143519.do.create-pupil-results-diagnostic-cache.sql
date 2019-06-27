IF NOT EXISTS (
    SELECT *
    FROM INFORMATION_SCHEMA.TABLES
    WHERE  TABLE_NAME = 'pupilResultsDiagnosticCache'
      AND TABLE_SCHEMA = 'mtc_admin'
    )
BEGIN
    CREATE TABLE [mtc_admin].[pupilResultsDiagnosticCache] (
      id INT IDENTITY,
      [school_id] INT NOT NULL,
      [payload] [NVARCHAR](MAX) NOT NULL,
      CONSTRAINT [PK_pupilResultsDiagnosticCache_id] PRIMARY KEY NONCLUSTERED (id)
    );
END
