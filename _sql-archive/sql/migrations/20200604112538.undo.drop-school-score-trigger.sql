CREATE OR ALTER TRIGGER [mtc_admin].[schoolScoreUpdatedAtTrigger]
    ON [mtc_admin].[schoolScore]
    FOR UPDATE
    AS
BEGIN
    UPDATE [mtc_admin].[schoolScore]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [schoolScore].id = inserted.id
END
