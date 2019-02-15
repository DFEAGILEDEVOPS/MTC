CREATE PROCEDURE mtc_admin.spRefreshScoreData @checkWindowId INTEGER
AS
    BEGIN

      IF (@checkWindowId IS NULL)
      BEGIN
        -- PICK CW ID WITHIN THE CURRENT CHECK PERIOD
        SET @checkWindowId = (
          SELECT id
          FROM [mtc_admin].checkWindow
          WHERE GETUTCDATE() BETWEEN checkStartDate AND adminEndDate
        )
      END
      IF (@checkWindowId IS NULL)
      BEGIN
        -- OTHERWISE PICK THE LAST CW ID THAT OCCURRED
        SET @checkWindowId = (
          SELECT TOP 1 id
          FROM [mtc_admin].checkWindow
          WHERE GETUTCDATE() > adminEndDate
          ORDER BY createdAt DESC
        )
      END

      -- CLEAR THE SCHOOL SCORE TABLE
      DELETE FROM [mtc_admin].schoolScore

      -- ADD DATA TO SCHOOL SCORE TABLE
      INSERT INTO mtc_admin.schoolScore (checkWindow_id, school_id, score)
        (
          SELECT
          ISNULL(latestPupilCheck.checkWindow_id, @checkWindowId) as checkWindowId,
          p.school_id,
          CAST(SUM(ISNULL(latestPupilCheck.mark, 0)) AS DECIMAL(5,2)) / COUNT(p.id) as schoolScore
          FROM
            mtc_admin.pupil p INNER JOIN
            mtc_admin.pupilStatus ps ON (ps.id = p.pupilStatus_id)
            -- FETCH COMPLETED PUPIL CHECK WITHIN THE CHECK WINDOW PERIOD
            LEFT OUTER JOIN
              (SELECT
                  chk.pupil_id,
                  chk.mark,
                  chk.checkWindow_id,
                  ROW_NUMBER() OVER (PARTITION BY chk.pupil_id ORDER BY chk.id DESC) as rank
                FROM mtc_admin.[check] chk
                INNER JOIN mtc_admin.checkStatus cs ON (cs.id = chk.checkStatus_id)
                WHERE cs.code = 'CMP'
                AND isLiveCheck = 1
                AND checkWindow_id = @checkWindowId
              ) latestPupilCheck ON p.id = latestPupilCheck.pupil_id
          WHERE
            ps.code <> 'NOT_TAKING'
          GROUP BY
            p.school_id,
            ISNULL(latestPupilCheck.checkWindow_id, @checkWindowId)
        )


      -- UPDATE (NATIONAL) SCORE FIELD ON CHECK WINDOW TABLE
        UPDATE [mtc_admin].checkWindow
        SET score = (
          SELECT AVG(score)
          FROM [mtc_admin].schoolScore
          WHERE checkWindow_id = @checkWindowId
        )
        WHERE id = @checkWindowId
    END
