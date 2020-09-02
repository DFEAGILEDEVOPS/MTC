CREATE OR ALTER TRIGGER [mtc_admin].[userInputTypeUpdatedAtTrigger]
    ON [mtc_admin].[userInputType]
    FOR UPDATE
    AS
BEGIN
    UPDATE [mtc_admin].[userInputType]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [userInputType].id = inserted.id
END
