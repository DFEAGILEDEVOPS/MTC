CREATE OR ALTER TRIGGER [mtc_admin].[pupilInsertUpdateAuditTrigger] ON [mtc_admin].[pupil]
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
                END
            ELSE
                BEGIN
                    -- I am an insert
                    SELECT @auditOperationTypeLookupId=1
                END
        END
    ELSE
        BEGIN
            -- i am a delete
            SELECT @auditOperationTypeLookupId=3
        END

    DECLARE @pupilId int
    DECLARE @lastModifiedBy_userId int
    DECLARE db_cursor CURSOR FOR
      SELECT i.id, i.lastModifiedBy_userId
      FROM inserted i

      OPEN db_cursor
        FETCH NEXT FROM db_cursor INTO @pupilId, @lastModifiedBy_userId
        WHILE @@FETCH_STATUS = 0
        BEGIN
          -- incorporate updatedAt trigger logic, to avoid duplicate audit entries
          IF @auditOperationTypeLookupId = 2
            BEGIN
              UPDATE [mtc_admin].[pupil] SET updatedAt = @updatedTimestamp WHERE id = @pupilId
            END
          SELECT @newDataJson = (SELECT TOP 1 * FROM inserted i WHERE i.id = @pupilId FOR JSON AUTO, WITHOUT_ARRAY_WRAPPER)
          SET @newDataJson = JSON_MODIFY(@newDataJson, '$.updatedAt', CAST(@updatedTimestamp AS NVARCHAR))
          -- do insert into pupil audit
          INSERT INTO [mtc_admin].[pupilAudit]
            (auditOperationTypeLookup_id, newData, pupil_id, operationBy_userId, sqlUserIdentifier)
          VALUES (@auditOperationTypeLookupId, @newDataJson, @pupilId, @lastModifiedBy_userId, SUSER_SNAME())

          FETCH NEXT FROM db_cursor INTO @pupilId, @lastModifiedBy_userId
        END

      CLOSE db_cursor
    DEALLOCATE db_cursor
END
