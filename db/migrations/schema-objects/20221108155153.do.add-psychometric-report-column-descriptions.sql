EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'PK, is also a reference to mtc_admin.pupil(id)', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'psychometricReport', @level2type = N'Column',
     @level2name = 'PupilId';


EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'The pupil UPN; from mtc_admin.pupil(upn).  Only unique within a school.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'psychometricReport', @level2type = N'Column',
     @level2name = 'PupilUPN';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Pupil date of birth; from mtc_admin.pupil(dateOfBirth)', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'psychometricReport', @level2type = N'Column',
     @level2name = 'DOB';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Marks awarded for the check; from  mtc_results.checkResult(mark)', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'psychometricReport', @level2type = N'Column',
     @level2name = 'FormMark';
