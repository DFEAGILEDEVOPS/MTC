CREATE TABLE  [mtc_admin].[pupilResultsDiagnosticCache] (
  [school_id] int not null,
  [payload] [NVARCHAR](max) NOT NULL,
  -- ensure a one-to-one mapping between check and checkPin
  CONSTRAINT [FK_pupilResultsDiagnosticCache_school_id_school_id] FOREIGN KEY (school_id) REFERENCES [mtc_admin].[school](id),
);
