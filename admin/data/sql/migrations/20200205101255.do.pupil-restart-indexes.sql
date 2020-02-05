IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilRestart]') AND NAME ='pupilRestart_pupil_id_index')
BEGIN
    DROP INDEX pupilRestart_pupil_id_index ON mtc_admin.[pupilRestart];
END
CREATE INDEX pupilRestart_pupil_id_index ON mtc_admin.[pupilRestart] (pupil_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilRestart]') AND NAME ='pupilRestart_pupilRestartReason_id_index')
BEGIN
    DROP INDEX pupilRestart_pupilRestartReason_id_index ON mtc_admin.[pupilRestart];
END
CREATE INDEX pupilRestart_pupilRestartReason_id_index ON mtc_admin.[pupilRestart] (pupilRestartReason_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilRestart]') AND NAME ='pupilRestart_check_id_index')
BEGIN
    DROP INDEX pupilRestart_check_id_index ON mtc_admin.[pupilRestart];
END
CREATE INDEX pupilRestart_check_id_index ON mtc_admin.[pupilRestart] (check_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilRestart]') AND NAME ='pupilRestart_originCheck_id_index')
BEGIN
    DROP INDEX pupilRestart_originCheck_id_index ON mtc_admin.[pupilRestart];
END
CREATE INDEX pupilRestart_originCheck_id_index ON mtc_admin.[pupilRestart] (originCheck_id)
