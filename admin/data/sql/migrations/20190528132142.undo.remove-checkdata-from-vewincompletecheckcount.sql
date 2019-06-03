ALTER VIEW [mtc_admin].[vewIncompleteCheckCount] AS
  SELECT c.pupil_id, COUNT(c.id) AS [IncompleteCheckCount]
  FROM [mtc_admin].[check] c
  WHERE c.pupilLoginDate IS NOT NULL AND c.data IS NULL
  GROUP BY c.pupil_id
