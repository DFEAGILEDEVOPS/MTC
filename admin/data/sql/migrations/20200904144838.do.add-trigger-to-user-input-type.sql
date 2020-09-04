CREATE OR ALTER TRIGGER mtc_results.userInputTypeUpdatedAtTrigger
    ON mtc_results.userInputType
    FOR UPDATE
    AS
BEGIN
    UPDATE mtc_results.userInputType
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [userInputType].id = inserted.id
END
