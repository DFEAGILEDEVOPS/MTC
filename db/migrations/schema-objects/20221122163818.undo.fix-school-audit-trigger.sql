DROP TRIGGER IF EXISTS [mtc_admin].[schoolInsertUpdateAuditTrigger];

go

CREATE OR ALTER TRIGGER [schoolInsertUpdateAuditTrigger] ON [mtc_admin].[school]
AFTER INSERT, UPDATE
AS
BEGIN
    DECLARE @auditOperationTypeLookupId int
    DECLARE @newDataJson NVARCHAR(MAX)
    DECLARE @updatedTimestamp DATETIMEOFFSET(3) = GETUTCDATE()
    -- infer audit type, populate var
    IF EXISTS (SELECT 1 FROM inserted)
        BEGIN
            IF EXISTS (SELECT 1 FROM deleted)
                BEGIN
                    -- I am an update
                    SELECT @auditOperationTypeLookupId=2
                    DECLARE @schoolId INT
                    SELECT @schoolId = id FROM inserted
                    -- incorporate updatedAt trigger logic, to avoid duplicate audit entries
                    UPDATE [mtc_admin].[school] SET updatedAt = @updatedTimestamp
                    WHERE id = @schoolId
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
    -- grab incoming data as JSON
    SELECT @newDataJson = (SELECT * FROM inserted FOR JSON AUTO, WITHOUT_ARRAY_WRAPPER)

    SET @newDataJson = JSON_MODIFY(@newDataJson, '$.updatedAt', CAST(@updatedTimestamp AS NVARCHAR))

    INSERT INTO [mtc_admin].[schoolAudit]
    (auditOperationTypeLookup_id, newData, school_id, operationBy_userId, sqlUserIdentifier)

    SELECT @auditOperationTypeLookupId, @newDataJson, i.id, i.lastModifiedBy_userId, SUSER_SNAME()
    FROM mtc_admin.school s
    INNER JOIN inserted i ON s.id = i.id
END
