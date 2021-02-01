CREATE TABLE [mtc_admin].[psychometricianReportCache]
(
    id INT IDENTITY
        CONSTRAINT PK_psychometricianReportCache
            PRIMARY KEY,
    check_id INT NOT NULL
        REFERENCES mtc_admin.[check],
    jsonData NVARCHAR(max) NOT NULL,
    version TIMESTAMP NOT NULL,
    createdAt DATETIMEOFFSET(3) DEFAULT getutcdate() NOT NULL,
    updatedAt DATETIMEOFFSET(3) DEFAULT getutcdate() NOT NULL
)
GO

GRANT DELETE ON mtc_admin.psychometricianReportCache to mtcAdminUser
GO

CREATE UNIQUE INDEX psychometricianReportCache_check_id_uindex
    on mtc_admin.psychometricianReportCache (check_id)
GO

CREATE TRIGGER [mtc_admin].[psychometricianReportCacheUpdatedAtTrigger]
    ON [mtc_admin].[psychometricianReportCache]
    FOR UPDATE
    AS
BEGIN
    UPDATE [mtc_admin].[psychometricianReportCache]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [psychometricianReportCache].id = inserted.id
END
