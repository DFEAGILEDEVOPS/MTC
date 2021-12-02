IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.check') AND NAME
                                                                                           ='check_checkStatus_id_index')
    BEGIN
        DROP INDEX check_checkStatus_id_index ON [mtc_admin].[check];
    END
CREATE INDEX check_checkStatus_id_index ON [mtc_admin].[check](checkStatus_id);
