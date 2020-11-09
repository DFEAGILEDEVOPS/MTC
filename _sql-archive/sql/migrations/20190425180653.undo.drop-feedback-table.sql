CREATE TABLE [mtc_admin].[pupilFeedback]
(
    id                 int identity primary key,
    createdAt          datetimeoffset(3) default getutcdate() not null,
    updatedAt          datetimeoffset(3) default getutcdate() not null,
    version            timestamp                              not null,
    inputType          int                                    not null,
    satisfactionRating tinyint,
    comments           nvarchar(max),
    check_id           int
    CONSTRAINT FK_pupilFeedback_check_id REFERENCES [mtc_admin].[check] (id)
);
