ALTER VIEW [mtc_admin].[vewCompletedCheckCount] AS
  SELECT c.pupil_id, COUNT(c.id) AS [CompletedCheckCount]
  FROM [mtc_admin].[check] c
  WHERE c.pupilLoginDate IS NULL
  GROUP BY c.pupil_id
