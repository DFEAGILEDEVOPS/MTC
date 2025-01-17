CREATE TABLE [mtc_admin].[pupilFeedback] (
    [id] INT IDENTITY (1, 1) NOT NULL,
    [createdAt] DATETIMEOFFSET (3) CONSTRAINT [DEFAULT_pupilFeedback_createdAt] DEFAULT GETUTCDATE() NOT NULL,
    [updatedAt] DATETIMEOFFSET (3) CONSTRAINT [DEFAULT_pupilFeedback_updatedAt] DEFAULT GETUTCDATE() NOT NULL,
    [version] [timestamp] NOT NULL,
    [check_id] INT NOT NULL,
    [pupil_id] INT NOT NULL,
    [school_id] INT NOT NULL,
    [feedback] NVARCHAR (255) NOT NULL,
    CONSTRAINT [PK_pupilFeedback] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_pupilFeedback_check] FOREIGN KEY ([check_id]) REFERENCES [mtc_admin].[check] ([id]),
    CONSTRAINT [FK_pupilFeedback_pupil] FOREIGN KEY ([pupil_id]) REFERENCES [mtc_admin].[pupil] ([id]),
    CONSTRAINT [FK_pupilFeedback_school] FOREIGN KEY ([school_id]) REFERENCES [mtc_admin].[school] ([id])
);
