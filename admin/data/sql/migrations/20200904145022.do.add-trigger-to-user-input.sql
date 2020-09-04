CREATE OR ALTER TRIGGER mtc_results.userInputUpdatedAtTrigger
    ON mtc_results.userInput
    FOR UPDATE
    AS
BEGIN
    UPDATE mtc_results.userInput
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [userInput].id = inserted.id
END
