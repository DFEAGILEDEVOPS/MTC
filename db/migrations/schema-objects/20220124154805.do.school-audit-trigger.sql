CREATE TRIGGER schoolInsertUpdateAuditTrigger ON [mtc_admin].[school]
AFTER INSERT, UPDATE
AS
BEGIN
    DECLARE @auditOperationTypeLookupId int
    DECLARE @newDataJson NVARCHAR(MAX)
    -- TODO infer audit type, populate var
    IF EXISTS (SELECT 1 FROM inserted)
        BEGIN
            IF EXISTS (SELECT 1 FROM deleted)
                BEGIN
                    -- I am an update
                    SELECT @auditOperationTypeLookupId=2
                    -- incorporate updatedAt trigger logic, to avoid duplicate audit entries
                    UPDATE [mtc_admin].[school] SET updatedAt = GETUTCDATE()
                    FROM inserted
                    WHERE [school].id = inserted.id
                END
            ELSE
                BEGIN
                    -- I am an insert
                    SELECT @auditOperationTypeLookupId=1
                END
        END
    ELSE
        BEGIN
            -- I am a delete (not currently supported)
            SELECT @auditOperationTypeLookupId=3
        END
    -- TODO convert incoming row into JSON, populate var
    SELECT @newDataJson = (SELECT * FROM inserted FOR JSON AUTO)
    INSERT INTO [mtc_admin].[schoolAudit]
    (auditOperationTypeLookup_id, newData, school_id, operationBy_userId)
    SELECT @auditOperationTypeLookupId, @newDataJson, i.id, i.lastModifiedBy_userId
    FROM mtc_admin.school s
    INNER JOIN inserted i ON s.id = i.id
END

ALTER TABLE [mtc_admin].[school] ENABLE TRIGGER [schoolInsertUpdateAuditTrigger]
