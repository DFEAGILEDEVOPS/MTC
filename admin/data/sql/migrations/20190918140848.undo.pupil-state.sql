alter table mtc_admin.pupil
  drop constraint pupil_attendanceCode_id_fk,
    DF_checkComplete_Default,
    DF_restartAvailable_Default,
    pupil_check_id_fk -- probably already done in undo check?

alter table mtc_admin.pupil drop column
  checkComplete, restartAvailable, attendanceId, currentCheckId


