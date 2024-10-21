ALTER TABLE [mtc_admin].[pupilAccessArrangements]
    ADD [retroInputAssistantFirstName] NVARCHAR (50) NULL,
        [retroInputAssistantLastName]  NVARCHAR (50) NULL,
        [retroInputAssistant_check_id] INT           NULL;

ALTER TABLE [mtc_admin].[pupilAccessArrangements] WITH CHECK
    ADD CONSTRAINT [FK_pupilAccessArrangements_check_id] FOREIGN KEY ([retroInputAssistant_check_id]) REFERENCES [mtc_admin].[check] ([id]);
