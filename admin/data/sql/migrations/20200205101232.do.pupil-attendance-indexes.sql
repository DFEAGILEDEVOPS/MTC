IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAttendance]') AND NAME ='pupilAttendance_attendanceCode_id_index')
BEGIN
    DROP INDEX pupilAttendance_attendanceCode_id_index ON mtc_admin.[pupilAttendance];
END
CREATE INDEX pupilAttendance_attendanceCode_id_index ON mtc_admin.[pupilAttendance] (attendanceCode_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAttendance]') AND NAME ='pupilAttendance_pupil_id_index')
BEGIN
    DROP INDEX pupilAttendance_pupil_id_index ON mtc_admin.[pupilAttendance];
END
CREATE INDEX pupilAttendance_pupil_id_index ON mtc_admin.[pupilAttendance] (pupil_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAttendance]') AND NAME ='pupilAttendance_user_id_index')
BEGIN
    DROP INDEX pupilAttendance_user_id_index ON mtc_admin.[pupilAttendance];
END
CREATE INDEX pupilAttendance_user_id_index ON mtc_admin.[pupilAttendance] (recordedBy_user_id)
