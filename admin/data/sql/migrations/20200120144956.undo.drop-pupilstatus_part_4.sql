IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.pupil')
                 AND col_name(object_ID, column_Id) = 'pupilStatus_id')
    BEGIN
        ALTER TABLE [mtc_admin].[pupil]
            ADD [pupilStatus_id] int NOT NULL,
                CONSTRAINT [DF_pupil_pupilStatus_id] DEFAULT 1 FOR [pupilStatus_id];
    END

