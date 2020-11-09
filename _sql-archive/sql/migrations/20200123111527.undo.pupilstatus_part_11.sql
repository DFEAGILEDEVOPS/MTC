IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.TABLES
               WHERE TABLE_NAME = 'mtc_admin'
                 AND TABLE_SCHEMA = 'checkResultDuplicates')
CREATE TABLE [mtc_admin].[checkResultDuplicates]
(
    id BIGINT IDENTITY,
    createdAt DATETIMEOFFSET NOT NULL,
    updatedAt DATETIMEOFFSET NOT NULL,
    payload NVARCHAR(max) NOT NULL,
    check_id INT NOT NULL,
    rank BIGINT
);
