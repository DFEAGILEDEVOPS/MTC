EXEC sys.sp_addextendedproperty @name = N'MS_Description',
@value = 'Type of Establishment Code - the value from mtc_admin.typeOfEstablishmentLookup.code (not the FK)',
@level0type = N'Schema',
@level0name = 'mtc_results',
@level1type = N'Table',
@level1name = 'psychometricReport',
@level2type = N'Column',
@level2name = 'ToECode';
