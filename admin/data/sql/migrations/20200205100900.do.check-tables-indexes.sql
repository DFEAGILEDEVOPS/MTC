-- check
IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[check]') AND NAME ='check_pupil_id_index')
BEGIN
    DROP INDEX check_pupil_id_index ON mtc_admin.[check];
END
CREATE INDEX check_pupil_id_index ON mtc_admin.[check] (pupil_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[check]') AND NAME ='check_checkForm_id_index')
BEGIN
    DROP INDEX check_checkForm_id_index ON mtc_admin.[check];
END
CREATE INDEX check_checkForm_id_index ON mtc_admin.[check] (checkForm_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[check]') AND NAME ='check_checkStatus_id_index')
BEGIN
    DROP INDEX check_checkStatus_id_index ON mtc_admin.[check];
END
CREATE INDEX check_checkStatus_id_index ON mtc_admin.[check] (checkStatus_id)


-- not recommended due to high activity
DROP INDEX IF EXISTS [mtc_admin].[check].[check_receivedByServerAt_index];
DROP INDEX IF EXISTS [mtc_admin].[check].[check_liveFlag_pupilId_index];


-- check config
IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[checkConfig]') AND NAME ='checkConfig_check_id_index')
BEGIN
    DROP INDEX checkConfig_check_id_index ON mtc_admin.[checkConfig];
END
CREATE INDEX checkConfig_check_id_index ON mtc_admin.[checkConfig] (check_id)


-- checkPin
IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[checkPin]') AND NAME ='checkPin_pin_id_index')
BEGIN
    DROP INDEX checkPin_pin_id_index ON mtc_admin.[checkPin];
END
CREATE INDEX checkPin_pin_id_index ON mtc_admin.[checkPin] (pin_id)
