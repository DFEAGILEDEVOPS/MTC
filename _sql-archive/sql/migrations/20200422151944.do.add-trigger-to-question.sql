CREATE OR ALTER TRIGGER [mtc_admin].[questionUpdatedAtTrigger]
    ON [mtc_admin].[question]
    FOR UPDATE
    AS
BEGIN
    UPDATE [mtc_admin].[question]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [question].id = inserted.id
END
