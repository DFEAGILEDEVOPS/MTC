CREATE VIEW [mtc_admin].vewNotStartedCheckCount
AS
   SELECT c.pupil_id, COUNT(c.id) AS [NotStartedCheckCount]
      FROM mtc_admin.[check] c
      WHERE c.pupilLoginDate IS NULL AND c.data IS NULL
   GROUP BY c.pupil_id
