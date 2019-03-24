ALTER PROCEDURE [mtc_census_import].[spPupilCensusImportFromStaging]
  (
    @censusImportTable AS censusImportTableType READONLY
    )
  AS
  DECLARE Source CURSOR
    FOR SELECT
          school.id,
          school.dfeNumber,
          census.foreName,
          census.middlenames,
          census.surname as lastName,
          census.gender,
          census.dob as dateOfBirth,
          census.upn
        FROM @censusImportTable as census JOIN
             [mtc_admin].[school] school ON (school.dfeNumber = CONVERT(INT, CONCAT(census.lea, census.estab)))
    FOR READ ONLY

  DECLARE @schoolId INT
  DECLARE @foreName NVARCHAR(max)
  DECLARE @lastName NVARCHAR(max)
  DECLARE @middleNames NVARCHAR(max)
  DECLARE @gender NVARCHAR(max)
  DECLARE @dateOfBirth NVARCHAR(max)
  DECLARE @upn NVARCHAR(max)
  DECLARE @insertCount INT = 0
  DECLARE @errorCount INT = 0
  DECLARE @lineCount INT = 0
  DECLARE @errorText NVARCHAR(max) = ''
  DECLARE @dfeNumber INT

  -- Insert all new pupils
  OPEN Source
  FETCH Source INTO @schoolId, @dfeNumber, @foreName, @middleNames, @lastName, @gender, @dateOfBirth, @upn
  WHILE (@@FETCH_STATUS = 0) BEGIN
    BEGIN TRY
      SET @lineCount += 1;
      INSERT INTO [mtc_admin].[pupil]
      (school_id, foreName, middleNames, lastName, gender, dateOfBirth, upn)
      VALUES
      (@schoolId, @foreName, @middleNames, @lastName, @gender, CONVERT(DATETIMEOFFSET, @dateOfBirth, 103), @upn);
      SET @insertCount += 1;
    END TRY
    BEGIN CATCH
      SET @errorCount += 1;

      IF (@errorCount <=  100)
        BEGIN
          IF LEN(@errorText) > 0
            SET @errorText += CHAR(10)
          SET @errorText += 'Error inserting pupil for dfeNumber ' + CONVERT(VARCHAR, @dfeNumber) + ', line ' + CONVERT(VARCHAR, @lineCount + 1) + ': ' + ERROR_MESSAGE()
        END
      ELSE IF @errorCount = 101
        SET @errorText += CHAR(10) + CHAR(10) + 'Too many errors; remaining errors have been omitted'
    END CATCH
    FETCH Source INTO @schoolId, @dfeNumber, @foreName, @middleNames, @lastName, @gender, @dateOfBirth, @upn
  END

  SELECT @insertCount as insertCount, @errorCount as errorCount, @errorText as errorText;

  CLOSE Source
  DEALLOCATE Source
  ;
