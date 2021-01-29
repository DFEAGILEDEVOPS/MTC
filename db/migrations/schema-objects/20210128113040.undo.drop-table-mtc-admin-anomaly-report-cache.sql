CREATE TABLE mtc_admin.anomalyReportCache
(id        INT IDENTITY
     CONSTRAINT PK_anomalyReportCache PRIMARY KEY,
 check_id  INT                                    NOT NULL REFERENCES mtc_admin.[check],
 jsonData  NVARCHAR(MAX)                          NOT NULL,
 version   TIMESTAMP                              NOT NULL,
 createdAt DATETIMEOFFSET(3) DEFAULT getutcdate() NOT NULL,
 updatedAt DATETIMEOFFSET(3) DEFAULT getutcdate() NOT NULL
)
GO

GRANT DELETE ON mtc_admin.anomalyReportCache TO mtcAdminUser
GO


CREATE TRIGGER [mtc_admin].[anomalyReportCacheUpdatedAtTrigger]
    ON [mtc_admin].[anomalyReportCache]
    FOR UPDATE AS
BEGIN
    UPDATE [mtc_admin].[anomalyReportCache]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [anomalyReportCache].id = inserted.id
END
