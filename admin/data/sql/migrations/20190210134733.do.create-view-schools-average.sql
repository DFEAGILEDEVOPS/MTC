CREATE VIEW [mtc_admin].[vewSchoolsAverageScore] AS

SELECT
p.school_id,
ISNULL(latestPupilCheck.checkWindow_id, 1) as checkWindowId,
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
      INNER JOIN mtc_admin.checkWindow cw ON (cw.id = chk.checkWindow_id)
      WHERE cs.code = 'CMP'
      AND isLiveCheck = 1
      AND GETUTCDATE() BETWEEN cw.checkStartDate AND cw.adminEndDate
    ) latestPupilCheck ON p.id = latestPupilCheck.pupil_id
WHERE
  ps.code <> 'NOT_TAKING'
GROUP BY
  p.school_id,
  ISNULL(latestPupilCheck.checkWindow_id, 1);
