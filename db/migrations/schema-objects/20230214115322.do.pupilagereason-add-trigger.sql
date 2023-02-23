CREATE TRIGGER [mtc_admin].[pupilAgeReasonUpdatedAtTrigger]
ON [mtc_admin].[pupilAgeReason]
FOR UPDATE
AS
BEGIN
    UPDATE [mtc_admin].[pupilAgeReason]
    SET updatedAt = GETUTCDATE()
    FROM inserted
    WHERE [pupilAgeReason].[id] = inserted.id
END;
