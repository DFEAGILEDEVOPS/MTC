CREATE OR ALTER TRIGGER [mtc_admin].[userInputUpdatedAtTrigger]
    ON [mtc_admin].[userInput]
    FOR UPDATE
    AS
BEGIN
    UPDATE [mtc_admin].[userInput]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [userInput].id = inserted.id
END
