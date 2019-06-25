EXEC sp_rename 'mtc_admin.spGetPupilsResults', spStorePupilsResults

GO

CREATE OR ALTER PROCEDURE mtc_admin.spStorePupilsResults @checkWindowId INTEGER = NULL
AS
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
        -- RAISE AN ERROR AND EXIT WHEN NO CW ID IS DETECTED
        RAISERROR ('NO CHECK WINDOW ID FOUND', 0, 1) WITH NOWAIT
        RETURN 1
      END

    -- DROP pupilResults TABLE BEFORE PERFORMING SELECT INTO
    DROP TABLE IF EXISTS mtc_admin.pupilResults

    -- SELECT ALL PUPIL RESULTS DATA INTO pupilResults TABLE
    SELECT
        p.id,
        p.school_id,
        p.foreName,
        p.middleNames,
        p.lastName,
        p.dateOfBirth,
        g.id as group_id,
        ps.code as pupilStatusCode,
        lastPupilRestart.id as pupilRestartId,
        lastPupilRestart.check_id as pupilRestartCheckId,
        latestPupilCheck.mark,
        latestPupilCheck.maxMark,
        cs.code as checkStatusCode,
        ac.reason
    INTO mtc_admin.pupilResults
    FROM [mtc_admin].[pupil] p
    JOIN [mtc_admin].[pupilStatus] ps
        ON (p.pupilStatus_id = ps.id)
    LEFT JOIN [mtc_admin].[pupilGroup] pg
        ON (p.id = pg.pupil_id)
    LEFT JOIN [mtc_admin].[group] g
        ON (pg.group_id = g.id)
    LEFT JOIN
        (SELECT
            pr.id,
            pr.pupil_id,
            pr.check_id,
            ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY pr.id DESC) as rank
         FROM [mtc_admin].[pupilRestart] pr
         WHERE isDeleted = 0
        ) lastPupilRestart
        ON (p.id = lastPupilRestart.pupil_id)
    LEFT JOIN
        (SELECT
          chk.checkWindow_id,
          chk.pupil_id,
          chk.checkStatus_id,
          chk.mark,
          chk.maxMark,
          ROW_NUMBER() OVER ( PARTITION BY chk.pupil_id ORDER BY chk.id DESC ) as rank
        FROM [mtc_admin].[check] chk
        INNER JOIN [mtc_admin].checkStatus cs
          ON cs.id = chk.checkStatus_id
          AND cs.code IN ('NTR', 'CMP')
          AND chk.isLiveCheck = 1
        WHERE chk.checkWindow_id = 1
        ) latestPupilCheck
        ON p.id = latestPupilCheck.pupil_id
    LEFT JOIN [mtc_admin].[checkStatus] cs
        ON (latestPupilCheck.checkStatus_id = cs.id)
    LEFT JOIN [mtc_admin].pupilAttendance pa
        ON (p.id = pa.pupil_id AND pa.isDeleted = 0)
    LEFT JOIN [mtc_admin].attendanceCode ac
        ON pa.attendanceCode_id = ac.id
    WHERE (ac.code IS NULL OR ac.code NOT IN ('LEFTT', 'INCRG'))
    AND (lastPupilRestart.rank = 1 or lastPupilRestart.rank IS NULL)
    AND (latestPupilCheck.rank = 1 OR latestPupilCheck.rank IS NULL)
