ALTER TABLE [mtc_admin].[pupilAccessArrangements] DROP CONSTRAINT [FK_pupilAccessArrangements_check_id];
ALTER TABLE [mtc_admin].[pupilAccessArrangements] DROP COLUMN [retroInputAssistant_check_id], COLUMN [retroInputAssistantFirstName], COLUMN [retroInputAssistantLastName];
