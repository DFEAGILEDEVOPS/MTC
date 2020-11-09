IF EXISTS (
  SELECT * 
  FROM   sys.columns 
  WHERE  object_id = OBJECT_ID(N'[mtc_admin].[group]') 
         AND name = 'loadingTimeLimit'
) 
BEGIN
  ALTER TABLE mtc_admin.[group] DROP COLUMN loadingTimeLimit
END

IF EXISTS (
  SELECT * 
  FROM   sys.columns 
  WHERE  object_id = OBJECT_ID(N'[mtc_admin].[group]') 
         AND name = 'questionTimeLimit'
) 
BEGIN
  ALTER TABLE mtc_admin.[group] DROP COLUMN questionTimeLimit
END
