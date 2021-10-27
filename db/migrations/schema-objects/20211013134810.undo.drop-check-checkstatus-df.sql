ALTER TABLE [mtc_admin].[check]
    ADD CONSTRAINT DF_check_checkStatus_id_default DEFAULT 1 FOR checkStatus_id;
