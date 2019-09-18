alter table mtc_admin.[check]
drop constraint
  check_pupilRestart_id_fk, DF_received_Default, DF_complete_Default,
  DF_processingFailed_Default

alter table mtc_admin.[check]
drop column
  received, complete, completedAt, processingFailed, pupilRestart_id
