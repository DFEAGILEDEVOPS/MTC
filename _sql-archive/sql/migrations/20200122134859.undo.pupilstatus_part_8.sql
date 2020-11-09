IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.TABLES
               WHERE TABLE_NAME = 'pupilStatus'
                 AND TABLE_SCHEMA = 'mtc_admin')
    BEGIN
        CREATE TABLE [mtc_admin].[pupilStatus]
        (id          int IDENTITY
             CONSTRAINT PK_pupilStatus PRIMARY KEY,
         createdAt   datetimeoffset(3) DEFAULT getutcdate() NOT NULL,
         updatedAt   datetimeoffset(3) DEFAULT getutcdate() NOT NULL,
         version     timestamp                              NOT NULL,
         description nvarchar(150)                          NOT NULL,
         code        nvarchar(12)                           NOT NULL
             CONSTRAINT pupilStatus_code_uindex UNIQUE
        );
    END