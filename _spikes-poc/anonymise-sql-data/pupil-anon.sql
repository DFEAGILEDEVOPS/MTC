DECLARE @id int
DECLARE @foreName nvarchar(128)
DECLARE @middleNames nvarchar(128)
DECLARE @lastName nvarchar(128)
DECLARE @dateOfBirth datetimeoffset(3) = DATEADD(YEAR, -10, GETDATE())
DECLARE @upn char(13)
-- cursor
DECLARE pupilCursor CURSOR FAST_FORWARD FOR 
SELECT id FROM [mtc_admin].pupil  
OPEN pupilCursor 
FETCH NEXT  FROM pupilCursor INTO @id 
WHILE @@FETCH_STATUS = 0
BEGIN 
    BEGIN TRY
    -- set vars
        SELECT @foreName = CAST(NEWID() AS VARCHAR(255))
        SELECT @middleNames = CAST(NEWID() AS VARCHAR(255))
        SELECT @lastName = CAST(NEWID() AS VARCHAR(255))
        SELECT @upn = LEFT(REPLACE(CAST(NEWID() AS VARCHAR(255)), '-', ''), 13)
        UPDATE mtc_admin.pupil SET foreName=@foreName, middleNames=@middleNames, lastName=@lastName, dateOfBirth=@dateOfBirth, upn=@upn WHERE id=@id
    END TRY 
   BEGIN CATCH 
      PRINT ERROR_MESSAGE()
      -- INSERT INTO @LoggingTable 
      -- SELECT GETDATE(), ERROR_MESSAGE() 
END CATCH
FETCH NEXT FROM pupilCursor INTO @id 
END
CLOSE pupilCursor
DEALLOCATE pupilCursor