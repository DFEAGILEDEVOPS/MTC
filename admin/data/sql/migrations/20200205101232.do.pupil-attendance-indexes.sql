IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAttendance]') AND NAME ='idx_pupilAttendance_attendanceCode_id')
BEGIN
    DROP INDEX idx_pupilAttendance_attendanceCode_id ON mtc_admin.[pupilAttendance];
END
CREATE INDEX idx_pupilAttendance_attendanceCode_id ON mtc_admin.[pupilAttendance] (attendanceCode_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAttendance]') AND NAME ='idx_pupilAttendance_pupil_id')
BEGIN
    DROP INDEX idx_pupilAttendance_pupil_id ON mtc_admin.[pupilAttendance];
END
CREATE INDEX idx_pupilAttendance_pupil_id ON mtc_admin.[pupilAttendance] (pupil_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAttendance]') AND NAME ='idx_pupilAttendance_user_id')
BEGIN
    DROP INDEX idx_pupilAttendance_user_id ON mtc_admin.[pupilAttendance];
END
CREATE INDEX idx_pupilAttendance_user_id ON mtc_admin.[pupilAttendance] (recordedBy_user_id)
