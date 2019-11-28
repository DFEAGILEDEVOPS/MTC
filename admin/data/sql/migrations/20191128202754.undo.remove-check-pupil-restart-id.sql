ALTER TABLE [mtc_admin].[check]
ADD pupilRestart_id integer,
CONSTRAINT [check_pupilRestart_id_fk] FOREIGN KEY (pupilRestart_id) REFERENCES [mtc_admin].[pupilRestart](id);