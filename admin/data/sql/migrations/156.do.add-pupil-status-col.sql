alter table [mtc_admin].[pupil] add status_id int
  constraint [FK_pupil_status_id_status_id] foreign key (status_id)
  references [mtc_admin].[pupilStatus] (id);
