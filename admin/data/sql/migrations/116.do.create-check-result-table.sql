create table mtc_admin.checkResult
(
  id bigint identity
    constraint PK__checkResult
    primary key,
  createdAt datetimeoffset constraint DF_checkResult_createdAt default getutcdate() not null,
  updatedAt datetimeoffset constraint DF_checkResult_updatedAt default getutcdate() not null,
  payload nvarchar(max) not null,
  checkFormAllocation_id int not null
    constraint checkResult_checkFormAllocation_id_fk
    references mtc_admin.checkFormAllocation
);
