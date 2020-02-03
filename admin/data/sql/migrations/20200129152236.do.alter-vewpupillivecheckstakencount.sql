CREATE OR ALTER VIEW [mtc_admin].[vewPupilLiveChecksTakenCount] AS

    SELECT
        p.id as pupil_id,
        p.foreName,
        p.middleNames,
        p.lastName,
        p.dateOfBirth,
        p.urlSlug,
        p.school_id,
        count(*) as totalCheckCount
      FROM
          [mtc_admin].[pupil] p JOIN
          [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id)
     WHERE
       -- don’t select pupils who are not attending
                 p.attendanceId IS NULL
       -- pupils must have already attempted 1 or more checks that are not expired
       AND       chk.pupilLoginDate IS NOT NULL
       AND       chk.isLiveCheck = 1
     GROUP BY
         p.id,
         p.foreName,
         p.middleNames,
         p.lastName,
         p.dateOfBirth,
         p.urlSlug,
         p.school_id
;
