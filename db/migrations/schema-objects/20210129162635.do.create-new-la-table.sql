CREATE TABLE [mtc_admin].[laCodeLookup] (
    [id] [int] IDENTITY(1,1) NOT NULL,
    [createdAt] [datetimeoffset](3) NOT NULL,
    [updatedAt] [datetimeoffset](3) NOT NULL,
    [version] [timestamp] NOT NULL,
    [laCode] [int] NOT NULL,
    [laName] NVARCHAR(200),
    CONSTRAINT IX_laCodeLookup_laCode_unique UNIQUE (laCode),
    CONSTRAINT PK_laCodeLookup_laCode PRIMARY KEY (id)
);
GO
ALTER TABLE [mtc_admin].[laCodeLookup] ADD CONSTRAINT [DF_laCodeLookup_updatedAt_default]  DEFAULT (getutcdate())
    FOR [updatedAt];
GO
ALTER TABLE [mtc_admin].[laCodeLookup] ADD CONSTRAINT [DF_laCodeLookup_createdAt_default]  DEFAULT (getutcdate())
    FOR [createdAt];
GO
CREATE TRIGGER [mtc_admin].[laCodeLookupUpdatedAtTrigger]
    ON [mtc_admin].[laCodeLookup]
    FOR UPDATE
    AS
BEGIN
    UPDATE [mtc_admin].[laCodeLookup]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [laCodeLookup].id = inserted.id
END
GO
ALTER TABLE [mtc_admin].[laCodeLookup] ENABLE TRIGGER [laCodeLookupUpdatedAtTrigger];
