CREATE TRIGGER [mtc_admin].[schoolUpdatedAtTrigger]
ON [mtc_admin].[school]
FOR UPDATE
AS
BEGIN
    UPDATE [mtc_admin].[school]
    SET updatedAt = GETUTCDATE()
    FROM inserted
    WHERE [school].id = inserted.id
END

ALTER TABLE [mtc_admin].[school] ENABLE TRIGGER [schoolUpdatedAtTrigger]
