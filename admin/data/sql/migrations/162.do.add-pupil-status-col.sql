alter table [mtc_admin].[pupil] add pupilStatus_id int
  constraint [FK_pupil_pupilStatus_id_pupilStatus_id] foreign key (pupilStatus_id)
  references [mtc_admin].[pupilStatus] (id);
