DECLARE @id int
DECLARE @foreName nvarchar(128)
DECLARE @middleNames nvarchar(128)
DECLARE @lastName nvarchar(128)
DECLARE @dateOfBirth datetimeoffset(3) = '1970-01-01'
DECLARE @upn char(13)
DECLARE @namePartLengths int = 128
-- cursor
DECLARE pupilCursor CURSOR LOCAL FAST_FORWARD FOR 
SELECT id FROM [mtc_admin].pupil  
OPEN pupilCursor 
FETCH NEXT  FROM pupilCursor INTO @id 
WHILE @@FETCH_STATUS = 0
-- set vars
    SELECT @foreName = LEFT(CAST(NEWID() AS VARCHAR(255)), FLOOR((@namePartLengths / 2.0)) + 1)
    SELECT @middleNames = LEFT(CAST(NEWID() AS VARCHAR(255)), FLOOR((@namePartLengths / 2.0)) + 1)
    SELECT @lastName = LEFT(CAST(NEWID() AS VARCHAR(255)), FLOOR((@namePartLengths / 2.0)) + 1)
    SELECT @upn = LEFT(CAST(NEWID() AS VARCHAR(255)), 13)
BEGIN 
    BEGIN TRY
        PRINT 'updating pupil with id:' + @id
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