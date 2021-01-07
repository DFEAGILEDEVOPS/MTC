CREATE TABLE mtc_admin.checkScore
(id        INT IDENTITY
     CONSTRAINT PK_checkScores PRIMARY KEY NONCLUSTERED,
 createdAt datetimeoffset(3) default getutcdate() not null,
 updatedAt datetimeoffset(3) default getutcdate() not null,
 version   timestamp                              not null,
 checkId   int                                    not null
     constraint FK_checkScores_checkId_check_id references mtc_admin.[check],
 mark      tinyint                                not null,
 markedAt  datetimeoffset(3)                      not null,
 INDEX ix_checkScore_check_id NONCLUSTERED (checkId)
);
