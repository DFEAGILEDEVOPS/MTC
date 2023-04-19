EXEC sys.sp_addextendedproperty
@name = N'MS_Description',
@value = 'Flag to indicate if the pupil was originally imported into the system via the census upload performed by the Service Manager.  May be subsequently edited by the school.',
@level0type = N'Schema',
@level0name = 'mtc_results',
@level1type = N'Table',
@level1name = 'psychometricReport',
@level2type = N'Column',
@level2name = 'ImportedFromCensus';
