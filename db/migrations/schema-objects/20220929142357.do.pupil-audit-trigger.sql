CREATE TRIGGER pupilInsertUpdateAuditTrigger ON [mtc_admin].[pupil]
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
                    DECLARE @pupilId INT
                    SELECT @pupilId = id FROM inserted
                    -- incorporate updatedAt trigger logic, to avoid duplicate audit entries
                    UPDATE [mtc_admin].[pupil] SET updatedAt = @updatedTimestamp
                    WHERE id = @pupilId
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
    PRINT @newDataJson
    SET @newDataJson = JSON_MODIFY(@newDataJson, '$.updatedAt', CAST(@updatedTimestamp AS NVARCHAR))
    PRINT @newDataJson
    INSERT INTO [mtc_admin].[pupilAudit]
    (auditOperationTypeLookup_id, newData, pupil_id, operationBy_userId, sqlUserIdentifier)
    SELECT @auditOperationTypeLookupId, @newDataJson, i.id, i.lastModifiedBy_userId, SUSER_SNAME()
    FROM mtc_admin.pupil s
    INNER JOIN inserted i ON s.id = i.id
END
GO
ALTER TABLE [mtc_admin].[pupil] ENABLE TRIGGER [pupilInsertUpdateAuditTrigger]
GO
