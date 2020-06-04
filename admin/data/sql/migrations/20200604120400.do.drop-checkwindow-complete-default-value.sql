IF EXISTS(SELECT *
            FROM sys.all_columns c
                 JOIN sys.tables t ON t.object_id = c.object_id
                 JOIN sys.schemas s ON s.schema_id = t.schema_id
                 JOIN sys.default_constraints d ON c.default_object_id = d.object_id
           WHERE t.name = 'checkWindow'
             AND c.name = 'complete'
             AND s.name = 'mtc_admin')
    BEGIN
        ALTER TABLE [mtc_admin].[checkWindow]
            DROP CONSTRAINT [completeDefault];
    END
