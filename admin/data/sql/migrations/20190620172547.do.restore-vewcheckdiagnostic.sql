IF NOT EXISTS (
  SELECT 1 FROM sys.views WHERE Name = 'vewCheckDiagnostic'
)
BEGIN
  EXEC('
    CREATE VIEW [mtc_admin].[vewCheckDiagnostic] AS
    select c.id           as check_id,
           c.createdAt,
           c.pupil_id,
           p.foreName,
           p.lastName,
           ps.code        as pupil_code,
           ps.description as pupil_descr,
           s.id           as school_id,
           s.dfeNumber,
           s.name         as school_name,
           s.pin          as school_pin,
           c.pupilLoginDate,
           c.startedAt,
           c.receivedByServerAt,
           c.isLiveCheck,
           c.mark,
           c.maxMark,
           c.markedAt,
           cs.code        as check_status,
           cs.description as check_desc,
           pin.val        as pupil_pin,
           cp.pinExpiresAt
    from [mtc_admin].[check] c
    join [mtc_admin].[checkStatus] cs on (c.checkStatus_id = cs.id)
    join [mtc_admin].[pupil] p on (c.pupil_id = p.id)
    join [mtc_admin].[pupilStatus] ps on (p.pupilStatus_id = ps.id)
    join [mtc_admin].[checkPin] cp on (c.id = cp.check_id)
    join [mtc_admin].[pin] pin on (cp.pin_id = pin.id)
    join [mtc_admin].[school] s on (p.school_id = s.id);
  ')
END