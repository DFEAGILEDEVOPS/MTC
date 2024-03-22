-- create an equal set of pupils for all schools

DECLARE @schoolId INT;
DECLARE @leaCode INT;
DECLARE @currentPupilCount INT;
DECLARE @desiredPupilCount INT = 30;

DECLARE schoolCursor CURSOR FOR
  SELECT
    s.id, s.leaCode, COUNT(p.id)
  FROM
      mtc_admin.school s
  LEFT OUTER JOIN
      mtc_admin.pupil p ON s.id = p.school_id
  GROUP BY
      s.id, s.leaCode
  HAVING COUNT(p.id) < @desiredPupilCount

OPEN schoolCursor
FETCH NEXT FROM schoolCursor INTO @schoolId, @leaCode, @currentPupilCount

WHILE @@FETCH_STATUS = 0
  BEGIN
    DECLARE @requiredPupilCount INT = @desiredPupilCount - @currentPupilCount
    INSERT INTO [mtc_admin].[pupil]
        (school_id, foreName, lastName, gender, dateOfBirth, upn)
    SELECT
        @schoolId as schoolId,
        CONCAT('Pupil-', pupilSet.pupilIndex) as foreName,
        CONCAT('School-', CAST(@schoolId AS VARCHAR)) as lastName,
        IIF(CRYPT_GEN_RANDOM(1) % 2 = 1, 'M', 'F') as gender,
            DATEADD(
            YEAR,
            -8,        -- subtract 8 years to make the pupil at least 8 years old
            DATEADD(
              DAY,
              - ABS( -- further subtract a random number of days between 0 and 363
                CHECKSUM(
                  NEWID()
                ) % 364
              ),
              CONCAT(YEAR(GETDATE()), '-09-01') -- E.g. The date to start our subtractions from: e.g. '2021-09-01' which is the start of the school year
            )
          ) as dateOfBirth,
        	[mtc_admin].[upnCheckLetter](
            CAST(CONCAT(
                CAST(@leaCode as VARCHAR),    -- 3 digit lea code
                FORMAT(ROUND(RAND(CHECKSUM(NEWID())) * 9999, 0), '0000'), -- 4 digit estab code
                FORMAT(ROUND(RAND(CHECKSUM(NEWID())) * 99, 0), '00'),  -- 2 digit creation year
                FORMAT(ROUND(RAND(CHECKSUM(NEWID())) * 999, 0), '000') -- 3 digit serial
            ) AS BIGINT)
        ) as upn
    FROM
      mtc_admin.school s
    INNER JOIN
      (SELECT value as [pupilIndex], @schoolId as [schoolId] FROM GENERATE_SERIES(1, @requiredPupilCount)) as pupilSet
    ON s.id = pupilSet.schoolId
    FETCH NEXT FROM schoolCursor INTO @schoolId, @leaCode, @currentPupilCount
  END

CLOSE schoolCursor
DEALLOCATE schoolCursor
