IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.TABLES
               WHERE TABLE_NAME = 'checkScore'
                 AND TABLE_SCHEMA = 'mtc_admin')
    BEGIN
        CREATE TABLE [mtc_admin].[checkScore]
        (id        int IDENTITY (1,1) NOT NULL,
         createdAt datetimeoffset(3)  NOT NULL DEFAULT GETUTCDATE(),
         updatedAt datetimeoffset(3)  NOT NULL DEFAULT GETUTCDATE(),
         version   rowversion,
         checkId   Int                NOT NULL,
         mark      TinyInt            NOT NULL,
         markedAt  datetimeoffset(3)  NOT NULL,
         CONSTRAINT PK_checkScores PRIMARY KEY NONCLUSTERED (id),
         CONSTRAINT FK_checkScores_checkId_check_id FOREIGN KEY (checkId) REFERENCES [mtc_admin].[check] (id)
        );
    END
