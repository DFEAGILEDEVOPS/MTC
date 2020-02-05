CREATE INDEX idx_pupilAttendance_attendanceCode_id ON mtc_admin.[pupilAttendance] (attendanceCode_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupilAttendance_pupil_id ON mtc_admin.[pupilAttendance] (pupil_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupilAttendance_user_id ON mtc_admin.[pupilAttendance] (recordedBy_user_id) WITH (DROP_EXISTING = ON)
