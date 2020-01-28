IF EXISTS(
        SELECT * FROM sys.columns
         WHERE object_ID=object_id('mtc_admin.pupil')
           AND col_name(object_ID,column_Id)='pupilStatus_id'
    )
    BEGIN
        ALTER TABLE [mtc_admin].[pupil]
            DROP COLUMN [pupilStatus_id];
    END;
