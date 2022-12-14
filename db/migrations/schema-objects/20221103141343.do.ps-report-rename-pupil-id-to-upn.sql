-- Rename pupil_id => pupil_upn
EXEC sp_rename 'mtc_results.psychometricReport.PupilId', 'PupilUPN', 'COLUMN';
