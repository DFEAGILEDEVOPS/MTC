ALTER VIEW [mtc_admin].[vewPupilRegister] AS
  SELECT
         p.id as pupilId,
         p.foreName,
         p.middleNames,
         p.lastName,
         p.urlSlug,
         p.dateOfBirth,
         p.school_id,
         p.group_id,
         ISNULL(g.name, '-') as groupName,
         ps.code as pupilStatusCode,
         lastCheck.id as lastCheckId,
         cs.code as lastCheckStatusCode,
         lastPupilRestart.id as pupilRestartId,
         lastPupilRestart.check_id as pupilRestartCheckId

  FROM
       [mtc_admin].[pupil] p LEFT JOIN
       [mtc_admin].[group] g ON (p.group_id = g.id) JOIN
       [mtc_admin].[pupilStatus] ps ON (p.pupilStatus_id = ps.id) LEFT JOIN
       (
         SELECT *,
                ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY id DESC) as rank
         FROM [mtc_admin].[check]
         WHERE isLiveCheck = 1
       ) lastCheck ON (lastCheck.pupil_id = p.id) LEFT JOIN
       [mtc_admin].[checkStatus] cs ON (lastCheck.checkStatus_id = cs.id) LEFT JOIN
       (
         SELECT *,
                ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY id DESC) as rank
         FROM [mtc_admin].[pupilRestart]
         WHERE isDeleted = 0
       ) lastPupilRestart ON (p.id = lastPupilRestart.pupil_id)
  WHERE
        (lastCheck.rank = 1 or lastCheck.rank IS NULL)
  AND   (lastPupilRestart.rank = 1 or lastPupilRestart.rank IS NULL);
