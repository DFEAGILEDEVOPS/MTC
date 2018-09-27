CREATE VIEW [mtc_admin].vewNotStartedCheckCount
AS
   SELECT c.pupil_id, COUNT(c.id) AS [CompletedCheckCount]
      FROM mtc_admin.[check] c
      WHERE c.pupilLoginDate IS NOT NULL
   GROUP BY c.pupil_id
