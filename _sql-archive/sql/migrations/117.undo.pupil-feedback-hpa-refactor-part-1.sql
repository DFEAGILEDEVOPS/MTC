alter table [mtc_admin].[pupilFeedback]
    drop constraint [FK_checkFormAllocation_id_checkFormAllocation_id];

alter table [mtc_admin].[pupilFeedback]
    drop column checkFormAllocation_id;
