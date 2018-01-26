CREATE TABLE [mtc].[mtc_admin].[integrationTest] (
  id INT IDENTITY NOT NULL PRIMARY KEY,
  tDecimal DECIMAL(5, 2),
  tNumeric NUMERIC(5, 3),
  tFloat FLOAT(24),
  tNvarchar NVARCHAR(10)
);
