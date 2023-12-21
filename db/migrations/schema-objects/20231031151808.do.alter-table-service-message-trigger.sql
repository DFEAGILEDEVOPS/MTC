CREATE TRIGGER [mtc_admin].[serviceMessageUpdatedAtTrigger]
    ON [mtc_admin].[serviceMessage]
    FOR UPDATE
    AS
BEGIN
    UPDATE [mtc_admin].[serviceMessage]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [serviceMessage].id = inserted.id
END
