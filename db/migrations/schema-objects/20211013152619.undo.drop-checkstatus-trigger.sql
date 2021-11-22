CREATE TRIGGER [mtc_admin].[checkStatusUpdatedAtTrigger]
    ON [mtc_admin].[checkStatus]
    FOR UPDATE AS
BEGIN
    UPDATE [mtc_admin].[checkStatus] SET updatedAt = GETUTCDATE() FROM inserted WHERE [checkStatus].id = inserted.id
END
