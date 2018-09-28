--
-- drop table [mtc_admin].[checkFormAllocation];
--
create table mtc_admin.checkFormAllocation
(
  id             int identity
    constraint PK_checkFormAllocation
    primary key,
  createdAt      datetimeoffset default getutcdate() not null,
  updatedAt      datetimeoffset default getutcdate() not null,
  version        timestamp                           not null,
  pupil_Id       int                                 not null
    constraint checkFormAllocation_pupil_id_fk
    references mtc_admin.pupil,
  checkForm_Id   int                                 not null
    constraint checkFormAllocation_checkForm_id_fk
    references mtc_admin.checkForm,
  checkWindow_Id int                                 not null
    constraint checkFormAllocation_checkWindow_id_fk
    references mtc_admin.checkWindow,
  checkCode      uniqueidentifier default newid()    not null,
  checkStatus_id int default 1                       not null
    constraint checkFormAllocation_checkStatus_id_fk
    references mtc_admin.checkStatus,
  isLiveCheck    bit                                 not null
)
go

--
-- alter table [mtc_admin].[pupilFeedback]
--   drop constraint FK_pupilFeedback_check_id;
-- alter table [mtc_admin].[pupilFeedback]
--   drop column checkFormAllocation_id;
--
alter table [mtc_admin].[pupilFeedback]
    add checkFormAllocation_id int
    constraint FK_checkFormAllocation_id_checkFormAllocation_id references [mtc_admin].[checkFormAllocation] (id);

-- alter table [mtc_admin].[checkResult]
--     add check_id int not null
--     constraint FK_checkResult_check_id_check_id references [mtc_admin].[check](id);
alter table [mtc_admin].[checkResult]
  drop constraint FK_checkResult_check_id_check_id;
alter table [mtc_admin].[checkResult]
  drop column check_id;

--
-- alter table [mtc_admin].[checkResult]
--     drop column checkFormAllocation_id;
alter table [mtc_admin].[checkResult]
  add checkFormAllocation_id int not null
  constraint checkResult_checkFormAllocation_id_fk references mtc_admin.checkFormAllocation (id);

--
-- drop index [mtc_admin].[checkResult].[checkResult_checkFormAllocation_id_uindex];
--
create unique index [checkResult_checkFormAllocation_id_uindex]
  on [mtc_admin].[checkResult] (checkFormAllocation_id);

--
-- -- Fold the checkFormAllocation table into the check table
-- alter table [mtc_admin].[check] add
--     checkStatus_id int not null
--         CONSTRAINT DF_check_checkStatus_id_default default 1
--         CONSTRAINT FK_check_checkStatus_id_checkStatus_id references [mtc_admin].[checkStatus](id),
--     isLiveCheck bit;
--
alter table [mtc_admin].[check]
  drop constraint
  DF_check_checkStatus_id_default,
  FK_check_checkStatus_id_checkStatus_id;
alter table [mtc_admin].[check]
  drop column
  checkStatus_id,
  isLiveCheck;

