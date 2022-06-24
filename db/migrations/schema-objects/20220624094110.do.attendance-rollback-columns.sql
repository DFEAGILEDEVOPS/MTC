
ALTER TABLE
  mtc_admin.[pupilAttendance]
ADD
  previousPupilCheckCompleteValue bit NULL,
  previousRestartAvailableValue bit NULL,
  previousPupilAttendanceId int NULL,
  previousPupilRestartId int NULL
