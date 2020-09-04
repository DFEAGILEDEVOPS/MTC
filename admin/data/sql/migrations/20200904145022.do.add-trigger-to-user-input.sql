CREATE OR ALTER TRIGGER mtc_reports.userInputUpdatedAtTrigger
    ON mtc_reports.userInput
    FOR UPDATE
    AS
BEGIN
    UPDATE mtc_reports.userInput
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [userInput].id = inserted.id
END
