ALTER TABLE [mtc_admin].[pupilRestart]
ADD parentCheckId INTEGER,
CONSTRAINT FK_pupilRestart_parentCheckId FOREIGN KEY (parentCheckId) references [mtc_admin].[check](id);
