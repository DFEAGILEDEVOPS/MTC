
alter table [mtc_admin].[check] add
  school_id int,
  pin nvarchar(12),
  pinExpiresAt datetimeoffset(3);
go

-- migrate school ids into new field
update chk
set school_id = p.school_id
FROM [mtc_admin].[check] chk
       JOIN [mtc_admin].[pupil] p ON (p.id = chk.pupil_id);

-- Add the school / pin index
create unique index [check_school_id_pin_checkStatus_id_uindex]
  on [mtc_admin].[check] (school_id, pin)
  where pin is not null
        and school_id is not null
        and checkStatus_id = 1;
