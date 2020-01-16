ALTER VIEW [mtc_admin].[vewCompletedCheckCount] AS
    SELECT c.pupil_id, COUNT(c.id) AS [CompletedCheckCount]
    FROM [mtc_admin].[check] c
             LEFT JOIN [mtc_admin].checkResult cr ON c.id = cr.check_id
    WHERE cr.id IS NOT NULL
    GROUP BY c.pupil_id
;