ALTER TABLE [mtc_admin].[pupil] ADD job_id int NULL
ALTER TABLE [mtc_admin].job ADD CONSTRAINT PK_job_id PRIMARY KEY (id)
ALTER TABLE [mtc_admin].[pupil] ADD CONSTRAINT FK_pupil_job_id FOREIGN KEY ([job_id]) REFERENCES [mtc_admin].[job] ([id])