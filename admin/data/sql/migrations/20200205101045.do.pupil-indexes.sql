IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupil]') AND NAME ='pupil_group_id_index')
BEGIN
    DROP INDEX pupil_group_id_index ON mtc_admin.[pupil];
END
CREATE INDEX [pupil_group_id_index] ON [mtc_admin].[pupil] ([group_id])


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupil]') AND NAME ='pupil_currentCheckId_index')
BEGIN
    DROP INDEX pupil_currentCheckId_index ON mtc_admin.[pupil];
END
CREATE INDEX pupil_currentCheckId_index ON [mtc_admin].pupil (currentCheckId)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupil]') AND NAME ='pupil_attendanceId_index')
BEGIN
    DROP INDEX pupil_attendanceId_index ON mtc_admin.[pupil];
END
CREATE INDEX pupil_attendanceId_index ON [mtc_admin].pupil (attendanceId)


DROP INDEX IF EXISTS [mtc_admin].[pupil].[pupil_job_id_index];
