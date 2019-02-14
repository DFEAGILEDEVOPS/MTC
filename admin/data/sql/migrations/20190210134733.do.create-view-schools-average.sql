CREATE VIEW [mtc_admin].[vewSchoolsAverage] AS

SELECT
  p.school_id,
  CAST(SUM(
      CASE
      WHEN (pa.id IS NOT NULL) THEN 0
      WHEN (latestPupilCheck.mark IS NOT NULL) THEN latestPupilCheck.mark
      ELSE 0
      END
  ) AS DECIMAL(5,2)) / COUNT(p.id) AS [schoolAverage]
FROM mtc_admin.pupil p
-- FETCH COMPLETED PUPIL CHECK WITHIN THE CHECK WINDOW PERIOD
LEFT OUTER JOIN
(SELECT chk2.id, chk2.pupil_id, chk2.mark, ROW_NUMBER() OVER ( PARTITION BY chk2.pupil_id ORDER BY chk2.markedAt DESC ) as rank
  FROM mtc_admin.[check] chk2
  INNER JOIN mtc_admin.checkStatus cs ON cs.id = chk2.checkStatus_id
  INNER JOIN mtc_admin.checkWindow cw ON cw.id = chk2.checkWindow_id
  WHERE cs.code = 'CMP'
        AND GETUTCDATE() BETWEEN cw.checkStartDate AND cw.adminEndDate
) latestPupilCheck
    ON p.id = latestPupilCheck.pupil_id
LEFT JOIN mtc_admin.pupilAttendance pa
      ON (p.id = pa.pupil_id AND pa.isDeleted = 0)
LEFT JOIN mtc_admin.attendanceCode ac
  ON pa.attendanceCode_id = ac.id
-- FETCH PUPILS WITH ATTENDANCE CODES OTHER THAN LEFT AND INCORRECT REGISTRATION
WHERE (ac.code IS NULL OR ac.code NOT IN ('LEFTT', 'INCRG'))
-- PICK THE PUPILS WITH THE LATEST COMPLETED CHECKS AND THE ONES WITH NO COMPLETED LIVE CHECK RECORDS
AND (latestPupilCheck.rank = 1 OR latestPupilCheck.rank IS NULL)
GROUP BY p.school_id
