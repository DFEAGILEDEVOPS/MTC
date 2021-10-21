DECLARE @id int
DECLARE @schoolName nvarchar(128)
DECLARE @estabCode int = 1000
-- 25 schools per lea fits all 18K~ into the 001-999 range
DECLARE @schoolsPerLea tinyint = 25
DECLARE @leaSchoolIndex tinyint = 0
DECLARE @leaCode int = 100
DECLARE @urn int = 100000

-- to avoid leaCode and estabCode clashes, reset all to values that are typically out of bounds
PRINT 'resetting schools...'
update mtc_admin.school set leaCode = 99999, estabCode = id, dfeNumber=id, urn=id
PRINT 'all schools reset'

-- NOTE: This is a work in progress and currently endlessly loops.
-- it provides more granular control over lea and estab codes, but 
-- would need converting to an updatable cursor before it can work correctly.

SET NOCOUNT ON

DECLARE schoolCursor CURSOR FORWARD_ONLY FOR 
SELECT id, [name], [leaCode], [estabCode], [urn], [dfeNumber] FROM [mtc_admin].school  
OPEN schoolCursor 
FETCH NEXT  FROM schoolCursor INTO @id --TODO add variables for other columns
WHILE @@FETCH_STATUS = 0
BEGIN 
    BEGIN TRY
    -- set vars
        IF @leaSchoolIndex < @schoolsPerLea
            SELECT @estabCode = @estabCode + 1
        ELSE
            BEGIN
                PRINT 'moving to next lea.  current leaCode:' + CAST(@leaCode AS NVARCHAR) + ' current estab:' + CAST(@estabCode AS NVARCHAR) + ' leaSchoolIndex:' + CAST(@leaSchoolIndex AS NVARCHAR)
                -- Next Lea, reset vars...
                SELECT @estabCode = 1000
                SELECT @leaCode = @leaCode + 1
                SELECT @leaSchoolIndex = 0
            END
        DECLARE @dfeNumber int = CAST(CAST(@leaCode AS NVARCHAR) + CAST(@estabCode AS NVARCHAR) AS int)
        SELECT @schoolName = CAST(NEWID() AS VARCHAR(255))
        --PRINT 'leaCode:' + CAST(@leaCode AS NVARCHAR) + ' estabCode:' + CAST(@estabCode AS NVARCHAR) + ' urn:' + CAST(@urn AS NVARCHAR) + ' dfeNumber:' + CAST(@dfeNumber AS NVARCHAR)
        -- TODO update cursor values
        SELECT @urn = @urn + 1
        SELECT @leaSchoolIndex = @leaSchoolIndex + 1
    END TRY 
   BEGIN CATCH 
      PRINT ERROR_MESSAGE()
END CATCH
FETCH NEXT FROM schoolCursor INTO @id 
END
CLOSE schoolCursor
DEALLOCATE schoolCursor