ALTER TABLE [mtc_admin].[check] ADD CONSTRAINT FK_check_checkStatus_id_checkStatus_id FOREIGN KEY (checkStatus_id)
    REFERENCES checkStatus(id);
