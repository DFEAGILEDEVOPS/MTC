CREATE TABLE [mtc_admin].[pupilResultsDiagnosticCache] (
  id INT IDENTITY,
  [school_id] INT NOT NULL,
  [payload] [NVARCHAR](MAX) NOT NULL,
  CONSTRAINT [PK_pupilResultsDiagnosticCache_id] PRIMARY KEY NONCLUSTERED (id)
);
