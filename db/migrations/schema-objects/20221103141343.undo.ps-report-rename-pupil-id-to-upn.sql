-- Rename col so we can re-use PupilId
EXEC sp_rename 'mtc_results.psychometricReport.PupilUPN', 'PupilId', 'COLUMN';

