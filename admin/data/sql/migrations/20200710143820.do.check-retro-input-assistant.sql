ALTER TABLE [mtc_admin].[pupilAccessArrangements] ADD retroInputAssistantFirstName nvarchar(50) NULL
ALTER TABLE [mtc_admin].[pupilAccessArrangements] ADD retroInputAssistantLastName nvarchar(50) NULL
ALTER TABLE [mtc_admin].[pupilAccessArrangements] ADD retroInputAssistantReason nvarchar(1000) NULL
ALTER TABLE [mtc_admin].[pupilAccessArrangements] ADD retroInputAssistant_check_id int NULL
ALTER TABLE [mtc_admin].[pupilAccessArrangements] ADD CONSTRAINT FK_pupilAccessArrangements_check_id
  FOREIGN KEY (retroInputAssistant_check_id) REFERENCES [mtc_admin].[check] (id)
