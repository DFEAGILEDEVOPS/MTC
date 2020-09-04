CREATE OR ALTER TRIGGER mtc_reports.userInputTypeUpdatedAtTrigger
    ON mtc_reports.userInputType
    FOR UPDATE
    AS
BEGIN
    UPDATE mtc_reports.userInputType
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [userInputType].id = inserted.id
END
