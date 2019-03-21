CREATE PROCEDURE [mtc_admin].[spPupilCensusUpsert]
  (
    @censusImportTable AS censusImportTableType READONLY
  )
AS
  MERGE INTO
    mtc_admin.pupil AS Target
  USING
    @censusImportTable AS Source
  ON Target.upn = Source.upn
  WHEN MATCHED THEN
    UPDATE SET
      Target.school_id   = (SELECT id
                            FROM mtc_admin.school
                            WHERE dfeNumber = CONVERT(INT, CONCAT(Source.lea, Source.estab))),
      Target.foreName    = Source.forename,
      Target.lastName    = Source.surname,
      Target.middleNames = Source.middlenames,
      Target.gender      = Source.gender,
      Target.dateOfBirth = CONVERT(DATETIMEOFFSET(3), Source.dob, 103)
  WHEN NOT MATCHED BY TARGET THEN
    INSERT (school_id, foreName, middleNames, lastName, gender, dateOfBirth, upn)
    VALUES
      (
        (SELECT id
         FROM mtc_admin.school
         WHERE dfeNumber = CONVERT(INT, CONCAT(Source.lea, Source.estab))),
        Source.forename,
        Source.middlenames,
        Source.surname,
        Source.gender,
        CONVERT(DATETIMEOFFSET(3), Source.dob, 103),
        Source.upn
      );
