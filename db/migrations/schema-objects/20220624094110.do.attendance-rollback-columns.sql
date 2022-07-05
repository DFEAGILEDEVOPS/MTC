
ALTER TABLE
  mtc_admin.[pupilAttendance]
ADD
  previousCheckCompleteValue bit NULL,
  previousRestartAvailableValue bit NULL,
  previousAttendanceId int NULL,
  previousRestartId int NULL
