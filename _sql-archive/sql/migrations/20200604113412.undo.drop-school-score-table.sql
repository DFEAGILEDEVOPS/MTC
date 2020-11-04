CREATE TABLE mtc_admin.schoolScore
(id             int IDENTITY
     CONSTRAINT PK_schoolScore PRIMARY KEY,
 school_id      int                                             NOT NULL
     CONSTRAINT FK_schoolScore_school_id_school_id REFERENCES mtc_admin.school,
 checkWindow_id int                                             NOT NULL
     CONSTRAINT FK_schoolScore_checkWindow_id_checkWindow_id REFERENCES mtc_admin.checkWindow,
 score          decimal(8, 2),
 createdAt      datetimeoffset(3)
     CONSTRAINT DF_school_score_created_at DEFAULT getutcdate() NOT NULL,
 updatedAt      datetimeoffset(3)
     CONSTRAINT DF_school_score_updated_at DEFAULT getutcdate() NOT NULL,
 version        rowversion                                      NOT NULL
);
