SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER TRIGGER [mtc_admin].[pupilInsertUpdateAuditTrigger] ON [mtc_admin].[pupil]
AFTER INSERT, UPDATE, DELETE
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
      FROM inserted i LEFT JOIN deleted d ON (i.id = d.id);
    DECLARE db_deleted_cursor CURSOR FOR
        SELECT d.id, d.lastModifiedBy_userId
        FROM deleted d;
    DECLARE @isEdited BIT;

	IF @auditOperationTypeLookupId IN (1,2)
      BEGIN
	      OPEN db_cursor
	        FETCH NEXT FROM db_cursor INTO @pupilId, @lastModifiedBy_userId
	        WHILE @@FETCH_STATUS = 0
	        BEGIN
	          -- grab the inserted/updated data
	          SELECT @newDataJson = (SELECT TOP 1 * FROM inserted i WHERE i.id = @pupilId FOR JSON AUTO, WITHOUT_ARRAY_WRAPPER)
	          -- incorporate updatedAt trigger logic, to avoid duplicate audit entries
	          IF @auditOperationTypeLookupId = 2
	            BEGIN
                    UPDATE [mtc_admin].[pupil] SET updatedAt = @updatedTimestamp WHERE id = @pupilId
                    SET @newDataJson = JSON_MODIFY(@newDataJson, '$.updatedAt', CAST(@updatedTimestamp AS NVARCHAR));

                    -- Set the isEdited flag if one of the core fields changed
                    UPDATE [mtc_admin].[pupil]
                    SET isEdited = 1
                    FROM inserted i join deleted d ON (i.id = d.id)
                    WHERE
                    pupil.id = i.id
                    AND
                    (i.foreName <> d.foreName
                    OR
                    i.lastName <> d.lastName
                    OR
                    i.upn <> d.upn
                    OR
                    i.gender <> d.gender
                    OR
                    CAST(i.dateOfBirth as DATE) <> CAST(d.dateOfBirth as DATE)
                    );

                     -- read the isEdited value back so we can modify the audit data.
                    SET @isEdited = (SELECT isEdited FROM [mtc_admin].[pupil] WHERE id = @pupilId);
                    SET @newDataJson = JSON_MODIFY(@newDataJson, '$.isEdited', @isEdited);
	            END

	          -- do insert into pupil audit for insert and update
	          INSERT INTO [mtc_admin].[pupilAudit]
	            (auditOperationTypeLookup_id, newData, pupil_id, operationBy_userId, sqlUserIdentifier)
	          VALUES (@auditOperationTypeLookupId, @newDataJson, @pupilId, @lastModifiedBy_userId, SUSER_SNAME())

	          FETCH NEXT FROM db_cursor INTO @pupilId, @lastModifiedBy_userId
	        END

	    CLOSE db_cursor
	    DEALLOCATE db_cursor
	END

	IF @auditOperationTypeLookupId = 3
    BEGIN
      OPEN db_deleted_cursor
      FETCH NEXT FROM db_deleted_cursor INTO @pupilId, @lastModifiedBy_userId
      WHILE @@FETCH_STATUS = 0
        BEGIN
          SELECT @newDataJson = (SELECT TOP 1 * FROM deleted d WHERE d.id = @pupilId FOR JSON AUTO, WITHOUT_ARRAY_WRAPPER);
          -- do insert into pupil audit
          INSERT INTO [mtc_admin].[pupilAudit]
           (auditOperationTypeLookup_id, newData, pupil_id, operationBy_userId, sqlUserIdentifier)
           VALUES (@auditOperationTypeLookupId, @newDataJson, @pupilId, @lastModifiedBy_userId, SUSER_SNAME());

          FETCH NEXT FROM db_deleted_cursor INTO @pupilId, @lastModifiedBy_userId
        END

          CLOSE db_deleted_cursor
          DEALLOCATE db_deleted_cursor
      END
END
GO
ALTER TABLE [mtc_admin].[pupil] ENABLE TRIGGER [pupilInsertUpdateAuditTrigger]
GO
