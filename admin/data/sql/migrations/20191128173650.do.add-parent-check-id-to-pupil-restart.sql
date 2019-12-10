ALTER TABLE [mtc_admin].[pupilRestart]
ADD originCheck_id INTEGER,
CONSTRAINT FK_pupilRestart_originCheck_id FOREIGN KEY (originCheck_id) references [mtc_admin].[check](id);
