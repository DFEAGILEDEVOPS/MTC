alter table mtc_admin.checkResult
  drop constraint DF_checkResult_createdAt;

alter table mtc_admin.checkResult
  drop constraint DF_checkResult_updatedAt;

alter table mtc_admin.checkResult
  drop constraint checkResult_checkFormAllocation_id_fk;

DROP TABLE mtc_admin.checkResult;
