CREATE PROCEDURE [mtc_admin].[spPupilCensusImportFromStaging]
  (
    @censusImportTable AS censusImportTableType READONLY
  )
AS
  PRINT GETUTCDATE() + ' Delete Starting'
  -- Delete all existing pupils not registered to test schools
  DELETE FROM [mtc_admin].[pupil]
  FROM [mtc_admin].[pupil] p
  INNER JOIN [mtc_admin].[school] s ON (p.school_id = s.id)
  WHERE s.leaCode <> 999;

  PRINT GETUTCDATE() + ' Delete complete'

  -- Insert all new pupils
  WITH Source
       (school_id, foreName, lastName, middlenames, gender, dateOfBirth, upn)
   AS
   (
     SELECT
       school.id, census.foreName, census.surname, census.middlenames, census.gender, census.dob, census.upn
     FROM @censusImportTable as census JOIN
          [mtc_admin].[school] school ON (school.dfeNumber = CONVERT(INT, CONCAT(census.lea, census.estab)))
   )
  INSERT INTO [mtc_admin].[pupil] (
    school_id, foreName, middleNames, lastName, gender, dateOfBirth, upn
  )
  VALUES
  (
    Source.school_id,
    Source.forename,
    Source.middlenames,
    Source.lastName,
    Source.gender,
    CONVERT(
      DATETIMEOFFSET(3),
        Source.dateOfBirth,
        103
      ),
    Source.upn
  );

PRINT GETUTCDATE() + ' proc complete'