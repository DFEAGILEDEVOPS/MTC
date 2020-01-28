IF EXISTS (
        select *
          from sys.all_columns c
               join sys.tables t on t.object_id = c.object_id
               join sys.schemas s on s.schema_id = t.schema_id
               join sys.default_constraints d on c.default_object_id = d.object_id
         where t.name = 'pupil'
           and c.name = 'pupilStatus_id'
           and s.name = 'mtc_admin')
    BEGIN
        ALTER TABLE [mtc_admin].[pupil]
        DROP CONSTRAINT [DF_pupil_pupilStatus_id];
    END
