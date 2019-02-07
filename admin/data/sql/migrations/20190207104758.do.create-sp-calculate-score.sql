CREATE PROCEDURE mtc_admin.spCalculateScore @scoreCalculationCheckWindowId INTEGER
AS
  BEGIN
    DECLARE @checkWindowId INTEGER = @scoreCalculationCheckWindowId

    DECLARE @checkWindowSchoolId INTEGER
    DECLARE @checkWindowSchoolIds CURSOR

    -- FETCH ALL SCHOOL IDS RELEVANT TO THE CHECK WINDOW
    SET @checkWindowSchoolIds = CURSOR FOR
      SELECT DISTINCT s.id
      FROM mtc_admin.[check] chk
        JOIN mtc_admin.pupil p
          ON chk.pupil_id = p.id
        JOIN mtc_admin.school s
          ON p.school_id = s.id
      WHERE chk.checkWindow_id = @checkWindowId

      OPEN @checkWindowSchoolIds
      FETCH NEXT FROM @checkWindowSchoolIds
      INTO @checkWindowSchoolId

    -- LOOP OVER EACH SCHOOL ID TO CALCULATE SCHOOL SCORE
    WHILE @@FETCH_STATUS = 0
    BEGIN

      -- FETCH LATEST COMPLETED CHECKS AND SUM THEIR SCORE
      DECLARE @markSum DECIMAL(5,2) = (
        SELECT CAST(SUM(chk.mark) AS DECIMAL(5, 2)) AS markSum
        FROM mtc_admin.[check] chk
          INNER JOIN (
           SELECT chk2.*, ROW_NUMBER() OVER ( PARTITION BY chk2.pupil_id ORDER BY chk2.id ASC ) as rank
           FROM mtc_admin.[check] chk2
             INNER JOIN mtc_admin.pupil p
               ON chk2.pupil_id = p.id
             INNER JOIN mtc_admin.school s
               ON p.school_id = s.id
           WHERE maxMark IS NOT NULL
                 AND s.id = @checkWindowSchoolId
          ) checksRanked
            ON chk.id = checksRanked.id
        WHERE checksRanked.rank = 1
      )
       -- FETCH THE COUNT OF ALL COMPLETED CHECKS
       DECLARE @pupilsWithScores INTEGER = (
         SELECT COUNT(chk.maxMark)
          FROM mtc_admin.[check] chk
            INNER JOIN (
             SELECT chk2.*, ROW_NUMBER() OVER ( PARTITION BY chk2.pupil_id ORDER BY chk2.id ASC ) as rank
             FROM mtc_admin.[check] chk2
               INNER JOIN mtc_admin.pupil p
                 ON chk2.pupil_id = p.id
               INNER JOIN mtc_admin.school s
                 ON p.school_id = s.id
             WHERE maxMark IS NOT NULL
                   AND s.id = @checkWindowSchoolId
            ) checksRanked
              ON chk.id = checksRanked.id
          WHERE checksRanked.rank = 1
       )
      -- FETCH THE MAXMARK VALUE
      DECLARE @maxMark DECIMAL(5,2) = (
        SELECT TOP 1 chk.maxMark
        FROM mtc_admin.[check] chk
          INNER JOIN mtc_admin.pupil p
            ON chk.pupil_id = p.id
          INNER JOIN mtc_admin.school s
            ON p.school_id = s.id
               AND maxMark IS NOT NULL
        WHERE s.id = @checkWindowSchoolId
        GROUP BY chk.maxMark
      )
      -- FETCH THE COUNT OF ALL PUPILS WITH ACCEPTABLE ATTENDANCE CODES
      DECLARE @pupilsWithZeroScore INTEGER = (
        SELECT COUNT(*) AS pupilsWithAttendanceCodes
        FROM mtc_admin.pupilAttendance pa
          JOIN mtc_admin.attendanceCode ac
            ON pa.attendanceCode_id = ac.id
          JOIN mtc_admin.pupil p
            ON pa.pupil_id = p.id
          JOIN mtc_admin.school s
            ON p.school_id = s.id
        WHERE ac.code <> 'LEFTT'
              AND ac.code <> 'INCRG'
              AND s.id = @checkWindowSchoolId
      )

      -- CALCULATE THE SCHOOL SCORE BASED ON THE FORMULA PROVIDED BELOW
      DECLARE @schoolScore DECIMAL(5,2) = @markSum / ((@pupilsWithScores * @maxMark) + (@pupilsWithZeroScore * @maxMark))

      DECLARE @schoolScoreId INTEGER = (
        SELECT id FROM mtc_admin.schoolScore
        WHERE school_id = @checkWindowSchoolId
      )

      -- IF SCHOOL DOES NOT HAVE SCORE INSERT OTHERWISE UPDATE
      IF (@schoolScoreId IS NULL)
        INSERT INTO mtc_admin.schoolScore (school_id, checkWindow_id, score)
          VALUES (@checkWindowSchoolId, @checkWindowId, @schoolScore)
      ELSE
        UPDATE mtc_admin.schoolScore
        SET score = @schoolScore
        WHERE school_id = @checkWindowSchoolId

      FETCH NEXT FROM @checkWindowSchoolIds
      INTO @checkWindowSchoolId

    END;
    CLOSE @checkWindowSchoolIds;
    DEALLOCATE @checkWindowSchoolIds;

    DECLARE @nationalScore DECIMAL(5,2) = (
        SELECT AVG(score)
        FROM mtc_admin.schoolScore
        WHERE checkWindow_id = @checkWindowId
    )

    DECLARE @adminEndDate DATETIMEOFFSET = (
      SELECT adminEndDate
      FROM mtc_admin.checkWindow
      WHERE id = @checkWindowId
    )
    -- SET COMPLETE FLAG TO TRUE ONLY IF ADMIN END DATE IS REACHED
    IF GETUTCDATE() >= @adminEndDate
      UPDATE mtc_admin.checkWindow
      SET complete = 1, score = @nationalScore
      WHERE id = @checkWindowId
    ELSE
      UPDATE mtc_admin.checkWindow
      SET score = @nationalScore
      WHERE id = @checkWindowId
  END
GO
