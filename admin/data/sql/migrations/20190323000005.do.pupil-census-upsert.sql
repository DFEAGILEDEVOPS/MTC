ALTER PROCEDURE [mtc_census_import].[spPupilCensusImportFromStaging]
  (
    @censusImportTable AS censusImportTableType READONLY
  )
AS
  DECLARE Source CURSOR
    FOR SELECT
          school.id,
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
  DECLARE @errorText NVARCHAR(max) = ''


  -- Delete all existing pupils not registered to test schools
  DELETE FROM [mtc_admin].[pupil]
  FROM [mtc_admin].[pupil] p
  INNER JOIN [mtc_admin].[school] s ON (p.school_id = s.id)
  WHERE s.leaCode <> 999;

  -- Insert all new pupils
  OPEN Source
  FETCH Source INTO @schoolId, @foreName, @middleNames, @lastName, @gender, @dateOfBirth, @upn
  WHILE (@@FETCH_STATUS = 0) BEGIN
    BEGIN TRY
        INSERT INTO [mtc_admin].[pupil]
        (school_id, foreName, middleNames, lastName, gender, dateOfBirth, upn)
        VALUES
        (@schoolId, @foreName, @middleNames, @lastName, @gender, CONVERT(DATETIMEOFFSET, @dateOfBirth, 103), @upn);

        SET @insertCount += 1;
    END TRY
    BEGIN CATCH
        SET @errorCount += 1;
    END CATCH
    FETCH Source INTO @schoolId, @foreName, @middleNames, @lastName, @gender, @dateOfBirth, @upn
  END

  SELECT @insertCount as insertCount, @errorCount as errorCount, @errorText as errorText;

  CLOSE Source
  DEALLOCATE Source
;
