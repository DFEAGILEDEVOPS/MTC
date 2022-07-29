ALTER TABLE mtc_admin.settings
ADD
  isPostAdminEndDateUnavailable BIT NOT NULL,
  CONSTRAINT DF_isPostAdminEndDateUnavailable DEFAULT 0 FOR isPostAdminEndDateUnavailable
;

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Set to 0 for the teacher role to see a Read Only site after the Admin End date, or 1 for them to get the final "Service Unavailable" page.', @level0type = N'Schema',
     @level0name = 'mtc_admin', @level1type = N'Table', @level1name = 'settings', @level2type = N'Column',
     @level2name = 'isPostAdminEndDateUnavailable';

