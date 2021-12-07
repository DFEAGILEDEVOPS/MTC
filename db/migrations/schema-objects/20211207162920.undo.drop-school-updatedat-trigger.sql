SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[schoolUpdatedAtTrigger]
    ON [mtc_admin].[school]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[school]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [school].id = inserted.id
    END
GO
ALTER TABLE [mtc_admin].[school] ENABLE TRIGGER [schoolUpdatedAtTrigger]
GO
