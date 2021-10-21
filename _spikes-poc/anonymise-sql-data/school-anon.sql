DECLARE @id int
DECLARE @schoolName nvarchar(128)
DECLARE @estabCode smallint = 1000
-- 25 schools per lea fits all 18K~ into the 001-999 range
DECLARE @schoolsPerLea tinyint = 25
DECLARE @leaSchoolIndex tinyint = 0
DECLARE @leaCode smallint = 100
DECLARE @urn int = 100000

SET NOCOUNT ON

-- to avoid leaCode and estabCode clashes, reset all to values that are typically out of bounds
update mtc_admin.school set leaCode = 99999, estabCode = id, dfeNumber=id, urn=id

DECLARE schoolCursor CURSOR FAST_FORWARD FOR 
SELECT id FROM [mtc_admin].school  
OPEN schoolCursor 
FETCH NEXT  FROM schoolCursor INTO @id 
WHILE @@FETCH_STATUS = 0
BEGIN 
    BEGIN TRY
    -- set vars
        IF @leaSchoolIndex < @schoolsPerLea
            SELECT @estabCode = @estabCode + 1
        ELSE
            BEGIN
                -- Next Lea, reset vars...
                SELECT @estabCode = 1000
                SELECT @leaCode = @leaCode + 1
                SELECT @leaSchoolIndex = 0
            END
        DECLARE @dfeNumber int = CAST(CAST(@leaCode AS NVARCHAR) + CAST(@estabCode AS NVARCHAR) AS int)
        SELECT @schoolName = CAST(NEWID() AS VARCHAR(255))
        UPDATE mtc_admin.school SET [name]=@schoolName, [leaCode]=@leaCode, [estabCode]=@estabCode, [urn]=@urn, [dfeNumber]=@dfeNumber WHERE id=@id
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