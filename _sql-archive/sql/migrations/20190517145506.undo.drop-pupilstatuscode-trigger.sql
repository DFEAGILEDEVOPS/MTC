
CREATE TRIGGER [mtc_admin].[pupilStatusCodeUpdatedAtTrigger]
ON [mtc_admin].[pupilStatusCode]
FOR UPDATE
AS
BEGIN
    UPDATE [mtc_admin].[pupilStatusCode]
    SET updatedAt = GETUTCDATE()
    FROM inserted
    WHERE [pupilStatusCode].id = inserted.id
END
