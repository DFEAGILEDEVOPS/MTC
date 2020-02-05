IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilRestart]') AND NAME ='idx_pupilRestart_pupil_id')
BEGIN
    DROP INDEX idx_pupilRestart_pupil_id ON mtc_admin.[pupilRestart];
END
CREATE INDEX idx_pupilRestart_pupil_id ON mtc_admin.[pupilRestart] (pupil_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilRestart]') AND NAME ='idx_pupilRestart_pupilRestartReason_id')
BEGIN
    DROP INDEX idx_pupilRestart_pupilRestartReason_id ON mtc_admin.[pupilRestart];
END
CREATE INDEX idx_pupilRestart_pupilRestartReason_id ON mtc_admin.[pupilRestart] (pupilRestartReason_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilRestart]') AND NAME ='idx_pupilRestart_check_id')
BEGIN
    DROP INDEX idx_pupilRestart_check_id ON mtc_admin.[pupilRestart];
END
CREATE INDEX idx_pupilRestart_check_id ON mtc_admin.[pupilRestart] (check_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilRestart]') AND NAME ='idx_pupilRestart_originCheck_id')
BEGIN
    DROP INDEX idx_pupilRestart_originCheck_id ON mtc_admin.[pupilRestart];
END
CREATE INDEX idx_pupilRestart_originCheck_id ON mtc_admin.[pupilRestart] (originCheck_id)
