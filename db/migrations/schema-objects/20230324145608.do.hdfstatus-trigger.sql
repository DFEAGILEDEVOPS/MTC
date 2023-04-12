CREATE TRIGGER [mtc_admin].[hdfStatusUpdatedAtTrigger]
ON [mtc_admin].[hdfStatusLookup]
FOR UPDATE
AS
BEGIN
    UPDATE [mtc_admin].[hdfStatusLookup]
    SET updatedAt = GETUTCDATE()
    FROM inserted
    WHERE [hdfStatusLookup].id = inserted.id
END

ALTER TABLE [mtc_admin].[hdfStatusLookup] ENABLE TRIGGER [hdfStatusLookupUpdatedAtTrigger]
