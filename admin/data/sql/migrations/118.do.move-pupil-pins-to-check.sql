-- Fold the checkFormAllocation table into the check table
alter table [mtc_admin].[check] add
  checkStatus_id int not null
    CONSTRAINT DF_check_checkStatus_id_default default 1
    CONSTRAINT FK_check_checkStatus_id_checkStatus_id references [mtc_admin].[checkStatus](id),
  isLiveCheck bit not null;

alter table [mtc_admin].[checkFormAllocation]
  drop constraint
  [checkFormAllocation_pupil_id_fk],
  [checkFormAllocation_checkForm_id_fk],
  [checkFormAllocation_checkWindow_id_fk],
  [checkFormAllocation_checkStatus_id_fk];

alter table [mtc_admin].[checkResult]
    drop constraint checkResult_checkFormAllocation_id_fk;

drop index [mtc_admin].[checkResult].[checkResult_checkFormAllocation_id_uindex];

alter table [mtc_admin].[checkResult]
    drop column checkFormAllocation_id;

alter table [mtc_admin].[checkResult]
  add check_id int not null
  constraint FK_checkResult_check_id_check_id references [mtc_admin].[check](id);

alter table [mtc_admin].[pupilFeedback]
    drop constraint FK_checkFormAllocation_id_checkFormAllocation_id;
alter table [mtc_admin].[pupilFeedback]
    drop column checkFormAllocation_id;

drop table [mtc_admin].[checkFormAllocation];


-- move pupil pin to check pin
alter table [mtc_admin].[check]
  add
  pin nvarchar(12),
  pinExpiresAt datetimeoffset(3),
  school_id int;
go

-- migrate school ids into new field
update chk
set school_id = p.school_id
FROM [mtc_admin].[check] chk JOIN [mtc_admin].[pupil] p
         ON (p.id = chk.pupil_id);

-- make school_id not null
alter table [mtc_admin].[check] alter column school_id int not null;
go

-- Add the school / pin index
create unique index [check_school_id_pin_uindex]
  on [mtc_admin].[check] (school_id, pin)
  where pin is not null;

-- remove the pin and expiry from the pupil table
drop index [mtc_admin].[pupil].[pupil_school_id_pin_uindex];
alter table [mtc_admin].[pupil]
    drop column pin, pinExpiresAt;
