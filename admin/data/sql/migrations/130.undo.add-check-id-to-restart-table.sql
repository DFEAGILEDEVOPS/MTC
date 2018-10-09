alter table [mtc_admin].[pupilRestart]
  drop constraint [FK_pupilRestart_check_id_check_id];

alter table [mtc_admin].[pupilRestart]
  drop column check_id;
