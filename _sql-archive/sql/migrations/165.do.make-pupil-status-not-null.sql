alter table [mtc_admin].[pupil]
  alter column pupilStatus_id int not null;

alter table [mtc_admin].[pupil]
  add constraint [DF_pupil_pupilStatus_id] DEFAULT 1 FOR [pupilStatus_id];
