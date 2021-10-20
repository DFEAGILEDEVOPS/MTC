
DECLARE @schoolCount smallint = 500 --20000
DECLARE @currentSchoolIndex smallint = 1
DECLARE @estabCode smallint = 1000
DECLARE @schoolsPerLea tinyint = 25 
DECLARE @leaCode smallint = 100
DECLARE @urn int = 100000

WHILE @currentSchoolIndex < @schoolCount
BEGIN
     IF @estabCode < @schoolsPerLea
            SELECT @estabCode = @estabCode + 1
        ELSE
            BEGIN
                -- Next Lea
                SELECT @estabCode = 1000
                SELECT @leaCode = @leaCode + 1
            END
    DECLARE @schoolName nvarchar(128) = NEWID()
    BEGIN TRY
        DECLARE @dfeNumber int = CAST(CAST(@leaCode AS NVARCHAR) + CAST(@estabCode AS NVARCHAR) AS int)
        INSERT mtc_admin.school (leaCode, estabCode, [name], urn, dfeNumber) VALUES (@leaCode, @estabCode, @schoolName, @urn, @dfeNumber)
        SELECT @urn = @urn + 1
    END TRY
    BEGIN CATCH
        PRINT ERROR_MESSAGE()
    END CATCH
    SELECT @currentSchoolIndex = @currentSchoolIndex + 1
END
