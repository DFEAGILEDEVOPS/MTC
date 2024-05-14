SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[schoolImpersonationAuditUpdatedAtTrigger]
    ON [mtc_admin].[schoolImpersonationAudit]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[schoolImpersonationAudit]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [schoolImpersonationAudit].id = inserted.id
    END
GO
ALTER TABLE [mtc_admin].[schoolImpersonationAudit] ENABLE TRIGGER [schoolImpersonationAuditUpdatedAtTrigger]
GO
