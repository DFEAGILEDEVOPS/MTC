CREATE OR ALTER TRIGGER [mtc_admin].[checkScoreUpdatedAtTrigger]
    ON [mtc_admin].[checkScore]
    FOR UPDATE
    AS
BEGIN
    UPDATE [mtc_admin].[checkScore]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [checkScore].id = inserted.id
END
