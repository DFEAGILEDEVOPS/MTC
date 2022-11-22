DROP TRIGGER IF EXISTS [mtc_admin].[schoolInsertUpdateAuditTrigger];

go

CREATE OR ALTER TRIGGER [schoolInsertUpdateAuditTrigger] ON [mtc_admin].[school]
AFTER INSERT, UPDATE
AS
BEGIN
    DECLARE @auditOperationTypeLookupId int;
    DECLARE @newDataJson NVARCHAR(MAX);
    DECLARE @updatedTimestamp DATETIMEOFFSET(3) = GETUTCDATE();
    DECLARE @schoolId INT;
    -- infer audit type, populate var
    IF EXISTS (SELECT 1 FROM inserted)
        BEGIN
            IF EXISTS (SELECT 1 FROM deleted)
                BEGIN
                    -- I am an update
                    SELECT @auditOperationTypeLookupId=2
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

    DECLARE @lastModifiedBy_userId int
    DECLARE db_cursor CURSOR FOR
        SELECT i.id, i.lastModifiedBy_userId
        FROM inserted i;

        OPEN db_cursor
          FETCH NEXT FROM db_cursor INTO @schoolId, @lastModifiedBy_userId
          WHILE @@FETCH_STATUS = 0
          BEGIN
            -- incorporate updatedAt trigger logic, to avoid duplicate audit entries
            IF @auditOperationTypeLookupId = 2
              BEGIN
                UPDATE [mtc_admin].[school] SET updatedAt = @updatedTimestamp WHERE id = @schoolId;
              END
            SELECT @newDataJson = (SELECT TOP 1 * FROM inserted i WHERE i.id = @schoolId FOR JSON AUTO, WITHOUT_ARRAY_WRAPPER);
            SET @newDataJson = JSON_MODIFY(@newDataJson, '$.updatedAt', CAST(@updatedTimestamp AS NVARCHAR));
            -- do insert into school audit
            INSERT INTO [mtc_admin].[schoolAudit]
              (auditOperationTypeLookup_id, newData, school_id, operationBy_userId, sqlUserIdentifier)
            VALUES (@auditOperationTypeLookupId, @newDataJson, @schoolId, @lastModifiedBy_userId, SUSER_SNAME());

            FETCH NEXT FROM db_cursor INTO @schoolId, @lastModifiedBy_userId
          END

    CLOSE db_cursor
    DEALLOCATE db_cursor
END
