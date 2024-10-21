IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.TABLES
               WHERE TABLE_NAME = 'checkInputAssistant'
                 AND TABLE_SCHEMA = 'mtc_admin')
BEGIN
    CREATE TABLE [mtc_admin].[checkInputAssistant] (
    [id]              INT            IDENTITY (1, 1) NOT NULL,
    [pupil_id]        INT            NOT NULL,
    [check_id]        INT            NOT NULL,
    [isRetrospective] BIT            CONSTRAINT [DEFAULT_checkInputAssistant_isRetrospective] DEFAULT 0 NOT NULL,
    [foreName]        NVARCHAR (128) NOT NULL,
    [lastName]        NVARCHAR (128) NOT NULL,
    CONSTRAINT [PK_checkInputAssistant] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_checkInputAssistant_check] FOREIGN KEY ([check_id]) REFERENCES [mtc_admin].[check] ([id]),
    CONSTRAINT [FK_checkInputAssistant_pupil] FOREIGN KEY ([pupil_id]) REFERENCES [mtc_admin].[pupil] ([id])
    );
END
