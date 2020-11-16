IF EXISTS(SELECT *
            FROM INFORMATION_SCHEMA.TABLES
           WHERE TABLE_NAME = 'checkResult'
             AND TABLE_SCHEMA = 'mtc_admin')
    EXEC('CREATE TRIGGER [mtc_admin].[checkResultUpdatedAtTrigger]
    ON [mtc_admin].[checkResult]
    FOR UPDATE
    AS
BEGIN
    UPDATE [mtc_admin].[checkResult]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [checkResult].id = inserted.id
END')
