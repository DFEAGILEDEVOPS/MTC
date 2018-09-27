CREATE VIEW [mtc_admin].vewPupilActivity AS
SELECT p.urlSlug, p.foreName, p.lastName, s.id AS [school_id],
  COUNT(r.id) AS [restartCount],
  ISNULL(chkComp.CompletedCheckCount, 0) AS [CompletedCheckCount],
  ISNULL(chkInComp.IncompleteCheckCount, 0) AS [IncompleteCheckCount],
  ISNULL(chkNoStart.NotStartedCheckCount, 0) AS [NotStartedCheckCount]
FROM mtc_admin.pupil p
  INNER JOIN mtc_admin.school s ON p.school_id = s.id
  LEFT OUTER JOIN mtc_admin.pupilRestart r ON p.id = r.pupil_id
  LEFT OUTER JOIN mtc_admin.vewCompletedCheckCount chkComp ON p.id = chkComp.pupil_id
  LEFT OUTER JOIN mtc_admin.vewIncompleteCheckCount chkInComp ON p.id = chkInComp.pupil_id
  LEFT OUTER JOIN mtc_admin.vewNotStartedCheckCount chkNoStart ON p.id = chkNoStart.pupil_id
GROUP BY p.urlSlug, p.foreName, p.lastName, s.id,
  chkComp.CompletedCheckCount, chkInComp.IncompleteCheckCount, chkNoStart.NotStartedCheckCount
