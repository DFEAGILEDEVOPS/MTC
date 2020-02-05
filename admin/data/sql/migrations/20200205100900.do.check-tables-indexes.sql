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

IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[check]') AND NAME ='idx_check_checkStatus_id')
BEGIN
    DROP INDEX idx_check_checkStatus_id ON mtc_admin.[check];
END
CREATE INDEX idx_check_checkStatus_id ON mtc_admin.[check] (checkStatus_id)

-- not recommended due to high activity
DROP INDEX IF EXISTS [mtc_admin].[check].[check_receivedByServerAt_index];
DROP INDEX IF EXISTS [mtc_admin].[check].[check_liveFlag_pupilId_index];


-- heavily used lookup
IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[check]') AND NAME ='IX_check_pupil_id')
BEGIN
    DROP INDEX IX_check_pupil_id ON mtc_admin.[check];
END
CREATE INDEX [IX_check_pupil_id] ON [mtc_admin].[check] ([pupil_id]) INCLUDE ([checkForm_id])

-- check config
IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[check]') AND NAME ='idx_checkConfig_check_id')
BEGIN
    DROP INDEX idx_checkConfig_check_id ON mtc_admin.[check];
END
CREATE INDEX idx_checkConfig_check_id ON mtc_admin.[checkConfig] (check_id)

-- checkPin
IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[check]') AND NAME ='idx_checkPin_pin_id')
BEGIN
    DROP INDEX idx_checkPin_pin_id ON mtc_admin.[check];
END
CREATE INDEX idx_checkPin_pin_id ON mtc_admin.[checkPin] (pin_id)
