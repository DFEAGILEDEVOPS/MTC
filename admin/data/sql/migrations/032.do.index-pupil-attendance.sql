-- a pupil can only have one entry in the pupilAttendance table
CREATE UNIQUE INDEX pupilAttendance_pupil_id_uindex ON mtc_admin.pupilAttendance (pupil_id);
