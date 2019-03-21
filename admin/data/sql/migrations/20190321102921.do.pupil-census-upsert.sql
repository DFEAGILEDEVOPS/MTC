CREATE PROCEDURE [mtc_admin].[spPupilCensusUpsert]
  (
    @censusImportTable AS censusImportTableType READONLY
  )
AS
  WITH Source
    (school_id, foreName, lastName, middlenames, gender, dateOfBirth, upn)
    AS
    (
      SELECT
            school.id, census.foreName, census.surname, census.middlenames, census.gender, census.dob, census.upn
      FROM @censusImportTable as census JOIN
        [mtc_admin].[school] school ON (school.dfeNumber = CONVERT(INT, CONCAT(census.lea, census.estab)))
    )
  MERGE INTO
    mtc_admin.pupil AS Target
  USING
    Source
  ON Target.upn = Source.upn
  WHEN MATCHED THEN
    UPDATE SET
      Target.school_id   = Source.school_id,
      Target.foreName    = Source.forename,
      Target.lastName    = Source.lastName,
      Target.middleNames = Source.middlenames,
      Target.gender      = Source.gender,
      Target.dateOfBirth = CONVERT(DATETIMEOFFSET(3), Source.dateOfBirth, 103)
  WHEN NOT MATCHED BY TARGET THEN
    INSERT (school_id, foreName, middleNames, lastName, gender, dateOfBirth, upn)
    VALUES
      (
        Source.school_id,
        Source.forename,
        Source.middlenames,
        Source.lastName,
        Source.gender,
        CONVERT(DATETIMEOFFSET(3), Source.dateOfBirth, 103),
        Source.upn
      );
