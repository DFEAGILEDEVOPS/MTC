IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.TABLES
               WHERE TABLE_NAME = 'checkResult'
                 AND TABLE_SCHEMA = 'mtc_admin')
BEGIN
    CREATE TABLE [mtc_admin].[checkResult]
    (
        id BIGINT IDENTITY
            CONSTRAINT PK__checkResult
                PRIMARY KEY,
        createdAt DATETIMEOFFSET CONSTRAINT DF_checkResult_createdAt default getutcdate() not null,
        updatedAt DATETIMEOFFSET CONSTRAINT DF_checkResult_updatedAt default getutcdate() not null,
        payload NVARCHAR(max) NOT NULL,
        check_id INT NOT NULL
            CONSTRAINT checkResult_check_id_uindex
                UNIQUE
            CONSTRAINT FK_checkResult_check_id_check_id
                REFERENCES [mtc_admin].[check]
    );
END;
