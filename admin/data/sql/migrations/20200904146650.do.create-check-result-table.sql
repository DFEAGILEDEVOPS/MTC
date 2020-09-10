DROP TABLE IF EXISTS mtc_results.checkResult;

CREATE TABLE mtc_results.checkResult
(id        INT IDENTITY,
 createdAt DATETIMEOFFSET(3) DEFAULT getutcdate() NOT NULL,
 updatedAt DATETIMEOFFSET(3) DEFAULT getutcdate() NOT NULL,
 version   ROWVERSION                             NOT NULL,
 check_id  INT                                    NOT NULL,
 mark      TINYINT                                NOT NULL,
 markedAt  DATETIMEOFFSET(3)                      NOT NULL,
 userDevice_id INT, -- optional, so nullable
 CONSTRAINT PK_checkResult PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT FK_checkResult_check_id_check_id FOREIGN KEY (check_id) REFERENCES mtc_admin.[check] (id),
 CONSTRAINT result_check_id_uindex UNIQUE(check_id),
 CONSTRAINT FK_checkResult_userDevice_id FOREIGN KEY (userDevice_id) REFERENCES mtc_results.userDevice (id),
 CONSTRAINT checkResult_userDevice_uindex UNIQUE(userDevice_id)
 );
