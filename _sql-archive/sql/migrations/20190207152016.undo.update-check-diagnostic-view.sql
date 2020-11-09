ALTER VIEW [mtc_admin].[vewCheckDiagnostic] AS
select c.id           as check_id,
       c.pupil_id,
       p.foreName,
       p.lastName,
       ps.code        as pupil_code,
       ps.description as pupil_descr,
       c.pupilLoginDate,
       c.startedAt,
       c.receivedByServerAt,
       c.isLiveCheck,
       cs.code        as check_status,
       cs.description as check_desc
from [mtc_admin].[check] c
       join [mtc_admin].[checkStatus] cs on c.checkStatus_id = cs.id
       join [mtc_admin].[pupil] p on c.pupil_id = p.id
       join [mtc_admin].[pupilStatus] ps on p.pupilStatus_id = ps.id;
