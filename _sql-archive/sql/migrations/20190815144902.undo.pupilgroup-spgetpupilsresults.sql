ALTER PROCEDURE mtc_admin.spGetPupilsResults @checkWindowId INTEGER = NULL, @schoolId INTEGER = NULL
AS
SELECT p.id,
       p.foreName,
       p.middleNames,
       p.lastName,
       p.dateOfBirth,
       g.id                      as group_id,
       ps.code                   as pupilStatusCode,
       lastPupilRestart.id       as pupilRestartId,
       lastPupilRestart.check_id as pupilRestartCheckId,
       latestPupilCheck.mark,
       latestPupilCheck.maxMark,
       cs.code                   as checkStatusCode,
       ac.reason
FROM [mtc_admin].[pupil] p
         JOIN [mtc_admin].[pupilStatus] ps
              ON (p.pupilStatus_id = ps.id)
         LEFT JOIN [mtc_admin].[pupilGroup] pg
                   ON (p.id = pg.pupil_id)
         LEFT JOIN [mtc_admin].[group] g
                   ON (pg.group_id = g.id)
         LEFT JOIN
     (SELECT pr.id,
             pr.pupil_id,
             pr.check_id,
             ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY pr.id DESC) as rank
      FROM [mtc_admin].[pupilRestart] pr
      WHERE isDeleted = 0
     ) lastPupilRestart
     ON (p.id = lastPupilRestart.pupil_id)
         LEFT JOIN
     (SELECT chk.checkWindow_id,
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
      WHERE chk.checkWindow_id = @checkWindowId
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
  AND p.school_id = @schoolId
