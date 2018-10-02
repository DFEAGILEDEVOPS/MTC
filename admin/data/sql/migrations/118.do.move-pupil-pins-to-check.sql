-- Fold the checkFormAllocation table into the check table
alter table [mtc_admin].[check] add
  checkStatus_id int not null
    CONSTRAINT DF_check_checkStatus_id_default default 1
    CONSTRAINT FK_check_checkStatus_id_checkStatus_id references [mtc_admin].[checkStatus](id),
  isLiveCheck bit;
go

-- make all existing checks live ones
update [mtc_admin].[check] set isLiveCheck = 1;

alter table [mtc_admin].[check] alter column [isLiveCheck] bit not null;

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


