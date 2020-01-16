ALTER VIEW [mtc_admin].[vewIncompleteCheckCount] AS
    SELECT c.pupil_id, COUNT(c.id) AS [IncompleteCheckCount]
    FROM [mtc_admin].[check] c LEFT JOIN [mtc_admin].checkResult cr ON (c.id = cr.check_id)
    WHERE c.pupilLoginDate IS NOT NULL
      AND cr.id IS NULL
    GROUP BY c.pupil_id
;