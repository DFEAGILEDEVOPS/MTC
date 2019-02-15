CREATE PROCEDURE mtc_admin.spRefreshScoreData @checkWindowId INTEGER
AS
    BEGIN

      -- CLEAR THE SCHOOL SCORE TABLE
      DELETE FROM [mtc_admin].schoolScore

      -- ADD ALL VIEW DATA IN SCHOOL SCORE TABLE
      INSERT INTO mtc_admin.schoolScore (checkWindow_id, school_id, score)
        (SELECT @checkWindowId, school_id, schoolScore as score FROM mtc_admin.vewSchoolsAverageScore)

      -- UPDATE (NATIONAL) SCORE FIELD ON CHECK WINDOW TABLE
        UPDATE [mtc_admin].checkWindow
        SET score = (
          SELECT AVG(score)
          FROM [mtc_admin].schoolScore
          WHERE checkWindow_id = @checkWindowId
        )
        WHERE id = @checkWindowId
    END
