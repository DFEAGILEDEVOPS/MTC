-- utility script to create a large set of schools for more realistic testing

DECLARE @schoolCount smallint = 20000
DECLARE @currentSchoolIndex smallint = 1
DECLARE @estabCode smallint = 1000
DECLARE @schoolsPerLea tinyint = 25
DECLARE @leaSchoolIndex tinyint = 0
DECLARE @leaCode smallint = 100
DECLARE @urn int = 100000

SET NOCOUNT ON

WHILE @currentSchoolIndex < @schoolCount
BEGIN
     IF @leaSchoolIndex < @schoolsPerLea
        BEGIN
            SELECT @leaSchoolIndex = @leaSchoolIndex + 1
            SELECT @estabCode = @estabCode + 1
        END
    ELSE
        BEGIN
            -- Next Lea, reset vars...
            SELECT @estabCode = 1000
            SELECT @leaCode = @leaCode + 1
            SELECT @leaSchoolIndex = 0
        END
    DECLARE @schoolName nvarchar(50) = 'dummy school'
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
