IF EXISTS(SELECT *
            FROM INFORMATION_SCHEMA.TABLES
           WHERE TABLE_NAME = 'pupilStatus'
             AND TABLE_SCHEMA = 'mtc_admin')
EXEC('CREATE OR ALTER TRIGGER [mtc_admin].[pupilStatusUpdatedAtTrigger]
    ON [mtc_admin].[pupilStatus]
    FOR UPDATE AS
BEGIN
    UPDATE [mtc_admin].[pupilStatus] SET updatedAt = GETUTCDATE() FROM inserted WHERE [pupilStatus].id = inserted.id
END')
