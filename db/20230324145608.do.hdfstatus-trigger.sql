CREATE TRIGGER [mtc_admin].[hdfStatusUpdatedAtTrigger]
ON [mtc_admin].[hdfStatus]
FOR UPDATE
AS
BEGIN
    UPDATE [mtc_admin].[hdfStatus]
    SET updatedAt = GETUTCDATE()
    FROM inserted
    WHERE [hdfStatus].id = inserted.id
END

ALTER TABLE [mtc_admin].[hdfStatus] ENABLE TRIGGER [hdfStatusUpdatedAtTrigger]
