DECLARE @id int
DECLARE @schoolName nvarchar(128)
DECLARE @estabCode smallint
-- 25 schools per lea fits all 18K~ into the 001-999 range
DECLARE @schoolsPerLea tinyint = 25 
DECLARE @currentLeaCode smallint = 100

DECLARE schoolCursor CURSOR FAST_FORWARD FOR 
SELECT id FROM [mtc_admin].school  
OPEN schoolCursor 
FETCH NEXT  FROM schoolCursor INTO @id 
WHILE @@FETCH_STATUS = 0
BEGIN 
    BEGIN TRY
    -- set vars
        IF @estabCode < @schoolsPerLea
            SELECT @estabCode = @estabCode + 1
        ELSE
            BEGIN
                -- Next Lea
                SELECT @estabCode = 1
                SELECT @currentLeaCode = @currentLeaCode + 1
            END

        SELECT @schoolName = CAST(NEWID() AS VARCHAR(255))
        UPDATE mtc_admin.school SET [name]=@schoolName, [leaCode]=@currentLeaCode, estabCode=@estabCode WHERE id=@id
    END TRY 
   BEGIN CATCH 
      PRINT ERROR_MESSAGE()
END CATCH
FETCH NEXT FROM schoolCursor INTO @id 
END
CLOSE schoolCursor
DEALLOCATE schoolCursor