SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--  the setting of the updatedAt field and the audit entry creation are combined.
--  this is because the updatedAt trigger causes a 2nd audit entry to be created
    CREATE TRIGGER [mtc_admin].[schoolUpdatedAtAuditTrigger]
    ON [mtc_admin].[school]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[school]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [school].id = inserted.id
        -- add audit entry
        DECLARE @schoolId INT
        SELECT @schoolId = id FROM inserted
        DECLARE @oldData NVARCHAR(MAX)
        SET @oldData = (SELECT * FROM deleted FOR JSON AUTO)
        DECLARE @newData NVARCHAR(MAX)
        SET @newData = (SELECT * FROM inserted FOR JSON AUTO)

        INSERT INTO [mtc_admin].[schoolAudit] (school_id, oldData, newData)
        VALUES (@schoolId, @oldData, @newData)
    END
GO
ALTER TABLE [mtc_admin].[school] ENABLE TRIGGER [schoolUpdatedAtAuditTrigger]
GO
