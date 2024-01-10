CREATE OR ALTER TRIGGER [mtc_admin].[serviceMessageAreaLookupUpdatedAtTrigger]
    ON [mtc_admin].[serviceMessageAreaLookup]
    FOR UPDATE
    AS
BEGIN
    UPDATE [mtc_admin].[serviceMessageAreaLookup]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [serviceMessageAreaLookup].id = inserted.id
END;
