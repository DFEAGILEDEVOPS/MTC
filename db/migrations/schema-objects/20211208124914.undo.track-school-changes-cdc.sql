EXEC sys.sp_cdc_disable_table
    @source_schema = 'mtc_admin',
    @source_name = 'school',
    @capture_instance = 'mtc_admin_school'
