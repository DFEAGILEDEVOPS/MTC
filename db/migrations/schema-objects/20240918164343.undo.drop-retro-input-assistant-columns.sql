ALTER TABLE [mtc_admin].[pupilAccessArrangements]
    ADD [retroInputAssistantFirstName] NVARCHAR (50) NULL,
        [retroInputAssistantLastName]  NVARCHAR (50) NULL,
        [retroInputAssistant_check_id] INT           NULL;

ALTER TABLE [mtc_admin].[pupilAccessArrangements] WITH NOCHECK
    ADD CONSTRAINT [FK_pupilAccessArrangements_check] FOREIGN KEY ([retroInputAssistant_check_id]) REFERENCES [mtc_admin].[check] ([id]);
ALTER TABLE [mtc_admin].[pupilAccessArrangements] WITH CHECK CHECK CONSTRAINT [FK_pupilAccessArrangements_check];
