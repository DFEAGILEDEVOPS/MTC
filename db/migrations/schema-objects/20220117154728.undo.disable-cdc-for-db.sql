EXEC sys.sp_cdc_enable_db

EXEC sys.sp_cdc_enable_table
    @source_schema = 'mtc_admin',
    @source_name = 'school',
    @role_name = NULL
