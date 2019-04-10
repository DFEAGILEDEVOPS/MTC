DECLARE
    @ObjectName1 NVARCHAR(100)
SELECT @ObjectName1 = OBJECT_NAME([default_object_id])
FROM SYS.COLUMNS
WHERE [object_id] = OBJECT_ID('[mtc_admin].[checkWindow]')
  AND [name] = 'adminStartDate'
EXEC ('ALTER TABLE [mtc_admin].[checkWindow] DROP CONSTRAINT ' + @ObjectName1)
ALTER TABLE [mtc_admin].checkWindow
    ALTER COLUMN adminStartDate DATETIME2 NOT NULL
ALTER TABLE [mtc_admin].checkWindow
    ADD DEFAULT GETUTCDATE() FOR adminStartDate

DECLARE
    @ObjectName2 NVARCHAR(100)
SELECT @ObjectName2 = OBJECT_NAME([default_object_id])
FROM SYS.COLUMNS
WHERE [object_id] = OBJECT_ID('[mtc_admin].[checkWindow]')
  AND [name] = 'checkStartDate'
EXEC ('ALTER TABLE [mtc_admin].[checkWindow] DROP CONSTRAINT ' + @ObjectName2)
ALTER TABLE [mtc_admin].checkWindow
    ALTER COLUMN checkStartDate DATETIME2 NOT NULL
ALTER TABLE [mtc_admin].checkWindow
    ADD DEFAULT GETUTCDATE() FOR checkStartDate

DECLARE
    @ObjectName3 NVARCHAR(100)
SELECT @ObjectName3 = OBJECT_NAME([default_object_id])
FROM SYS.COLUMNS
WHERE [object_id] = OBJECT_ID('[mtc_admin].[checkWindow]')
  AND [name] = 'checkEndDate'
EXEC ('ALTER TABLE [mtc_admin].[checkWindow] DROP CONSTRAINT ' + @ObjectName3)
ALTER TABLE [mtc_admin].checkWindow
    ALTER COLUMN checkEndDate DATETIME2 NOT NULL
ALTER TABLE [mtc_admin].checkWindow
    ADD DEFAULT GETUTCDATE() FOR checkEndDate

DECLARE
    @ObjectName4 NVARCHAR(100)
SELECT @ObjectName4 = OBJECT_NAME([default_object_id])
FROM SYS.COLUMNS
WHERE [object_id] = OBJECT_ID('[mtc_admin].[checkWindow]')
  AND [name] = 'adminEndDate'
EXEC ('ALTER TABLE [mtc_admin].[checkWindow] DROP CONSTRAINT ' + @ObjectName4)
ALTER TABLE [mtc_admin].checkWindow
    ALTER COLUMN adminEndDate DATETIME2 NOT NULL
ALTER TABLE [mtc_admin].checkWindow
    ADD DEFAULT GETUTCDATE() FOR adminEndDate

DECLARE
    @ObjectName5 NVARCHAR(100)
SELECT @ObjectName5 = OBJECT_NAME([default_object_id])
FROM SYS.COLUMNS
WHERE [object_id] = OBJECT_ID('[mtc_admin].[checkWindow]')
  AND [name] = 'familiarisationCheckStartDate'
EXEC ('ALTER TABLE [mtc_admin].[checkWindow] DROP CONSTRAINT ' + @ObjectName5)
ALTER TABLE [mtc_admin].checkWindow
    ALTER COLUMN familiarisationCheckStartDate DATETIME2 NOT NULL
ALTER TABLE [mtc_admin].checkWindow
    ADD DEFAULT GETUTCDATE() FOR familiarisationCheckStartDate

DECLARE
    @ObjectName6 NVARCHAR(100)
SELECT @ObjectName6 = OBJECT_NAME([default_object_id])
FROM SYS.COLUMNS
WHERE [object_id] = OBJECT_ID('[mtc_admin].[checkWindow]')
  AND [name] = 'familiarisationCheckEndDate'
EXEC ('ALTER TABLE [mtc_admin].[checkWindow] DROP CONSTRAINT ' + @ObjectName6)
ALTER TABLE [mtc_admin].checkWindow
    ALTER COLUMN familiarisationCheckEndDate DATETIME2 NOT NULL
ALTER TABLE [mtc_admin].checkWindow
    ADD DEFAULT GETUTCDATE() FOR familiarisationCheckEndDate
