IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.TABLES
               WHERE TABLE_NAME = 'question'
                 AND TABLE_SCHEMA = 'mtc_admin')
    BEGIN
        CREATE TABLE [mtc_admin].[question]
        (id        int IDENTITY (1,1) NOT NULL PRIMARY KEY,
         createdAt datetimeoffset(3)  NOT NULL DEFAULT GETUTCDATE(),
         updatedAt datetimeoffset(3)  NOT NULL DEFAULT GETUTCDATE(),
         version   rowversion,
         factor1   tinyint not null,
         factor2   tinyint not null,
         code      varchar(10) NOT NULL,
         isWarmup  bit not null
        );
    END
