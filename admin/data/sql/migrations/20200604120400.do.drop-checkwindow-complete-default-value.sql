IF EXISTS (
        select *
          from sys.all_columns c
               join sys.tables t on t.object_id = c.object_id
               join sys.schemas s on s.schema_id = t.schema_id
               join sys.default_constraints d on c.default_object_id = d.object_id
         where t.name = 'checkWindow'
           and c.name = 'complete'
           and s.name = 'mtc_admin')
    BEGIN
        ALTER TABLE [mtc_admin].[checkWindow]
            DROP CONSTRAINT [completeDefault];
    END
