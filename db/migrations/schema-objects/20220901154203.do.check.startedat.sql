
ALTER TABLE
  mtc_admin.[check]
ADD
  startedAt datetimeoffset(3) NULL

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'the date and time the pupil clicked the button to start the official check.', @level0type = N'Schema',
     @level0name = 'mtc_admin', @level1type = N'Table', @level1name = 'check', @level2type = N'Column',
     @level2name = 'startedAt';
