CREATE TABLE [mtc_admin].[schoolImpersonationAudit] (
    [id]        INT                IDENTITY (1, 1) NOT NULL,
    [user_id]   INT                NOT NULL,
    [school_id] INT                NOT NULL,
    [createdAt] DATETIMEOFFSET (3) CONSTRAINT [DEFAULT_schoolImpersonationAudit_createdAt] DEFAULT GETUTCDATE() NOT NULL,
    [updatedAt] DATETIMEOFFSET (3) CONSTRAINT [DEFAULT_schoolImpersonationAudit_updatedAt] DEFAULT GETUTCDATE() NOT NULL,
    CONSTRAINT [PK_schoolImpersonationAudit] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_schoolImpersonationAudit_school] FOREIGN KEY ([school_id]) REFERENCES [mtc_admin].[school] ([id]),
    CONSTRAINT [FK_schoolImpersonationAudit_user] FOREIGN KEY ([user_id]) REFERENCES [mtc_admin].[user] ([id])
);
