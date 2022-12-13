-- Rename index - the previous renames have renamed the cols in the index but not the index name.
EXEC sp_rename 'mtc_results.psychometricReport.IX_psychometricReport_SchoolURN_PupilId_unique', 'IX_psychometricReport_SchoolURN_PupilUPN_unique', 'INDEX';
