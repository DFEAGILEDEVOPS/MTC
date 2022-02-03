EXEC sys.sp_cdc_enable_table
    @source_schema = 'mtc_admin',
    @source_name = 'school',
    @role_name = NULL

-- to view changes...
/*
SELECT * FROM cdc.mtc_admin_school_CT
*/
