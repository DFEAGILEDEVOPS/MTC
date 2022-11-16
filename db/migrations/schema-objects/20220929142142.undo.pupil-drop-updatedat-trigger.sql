CREATE TRIGGER [mtc_admin].[pupilUpdatedAtTrigger]
ON [mtc_admin].[pupil]
FOR UPDATE
AS
BEGIN
    UPDATE [mtc_admin].[pupil]
    SET updatedAt = GETUTCDATE()
    FROM inserted
    WHERE [pupil].id = inserted.id
END

ALTER TABLE [mtc_admin].[pupil] ENABLE TRIGGER [pupilUpdatedAtTrigger]
