ALTER VIEW [mtc_admin].[vewCompletedCheckCount] AS
  SELECT c.pupil_id, COUNT(c.id) AS [CompletedCheckCount]
  FROM [mtc_admin].[check] c
    LEFT JOIN [mtc_admin].checkResult ck ON (c.id = ck.check_id)
  WHERE ck.id IS NOT NULL
  GROUP BY c.pupil_id
