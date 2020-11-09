ALTER VIEW [mtc_admin].[vewCompletedCheckCount] AS
    SELECT c.pupil_id, COUNT(c.id) AS [CompletedCheckCount]
    FROM [mtc_admin].[check] c
    WHERE c.complete = 1
    GROUP BY c.pupil_id
;