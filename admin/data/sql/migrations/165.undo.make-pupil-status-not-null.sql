alter table [mtc_admin].[pupil]
  alter column pupilStatus_id int;

alter table [mtc_admin].[pupil]
  drop constraint [DF_pupil_pupilStatus_id];
