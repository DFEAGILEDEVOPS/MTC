IF NOT EXISTS (
  SELECT * 
  FROM   sys.columns 
  WHERE  object_id = OBJECT_ID(N'[mtc_admin].[group]') 
         AND name = 'loadingTimeLimit'
) 
BEGIN
  ALTER TABLE mtc_admin.[group] ADD loadingTimeLimit DECIMAL(5,2) NULL
END

IF NOT EXISTS (
  SELECT * 
  FROM   sys.columns 
  WHERE  object_id = OBJECT_ID(N'[mtc_admin].[group]') 
         AND name = 'questionTimeLimit'
) 
BEGIN
  ALTER TABLE mtc_admin.[group] ADD questionTimeLimit DECIMAL(5,2) NULL
END
