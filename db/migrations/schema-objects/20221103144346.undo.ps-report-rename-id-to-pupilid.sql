-- Rename col
EXEC sp_rename 'mtc_results.psychometricReport.PupilId', 'id', 'COLUMN';

go

-- Undo modify the updatedAt trigger as the PK is now PupilId, not id.
ALTER TRIGGER [mtc_results].[psychometricReportUpdatedAtTrigger]
    ON [mtc_results].[psychometricReport]
    FOR UPDATE AS
BEGIN
    UPDATE [mtc_results].[psychometricReport]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [psychometricReport].id = inserted.id
END
