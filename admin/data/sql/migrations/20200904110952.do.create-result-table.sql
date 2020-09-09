DROP TABLE IF EXISTS mtc_results.checkResult;

CREATE TABLE mtc_results.checkResult
(id        INT IDENTITY,
 createdAt DATETIMEOFFSET(3) DEFAULT getutcdate() NOT NULL,
 updatedAt DATETIMEOFFSET(3) DEFAULT getutcdate() NOT NULL,
 version   ROWVERSION                             NOT NULL,
 check_id  INT                                    NOT NULL,
 mark      TINYINT                                NOT NULL,
 markedAt  DATETIMEOFFSET(3)                      NOT NULL,
 CONSTRAINT PK_result PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT FK_result_check_id_check_id FOREIGN KEY (check_id) REFERENCES mtc_admin.[check] (id),
 CONSTRAINT result_check_id_uindex UNIQUE(check_id),
 );
