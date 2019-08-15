create table mtc_admin.pupilGroup
(
    id int identity primary key,
    group_id  int not null references mtc_admin.[group],
    pupil_id  int not null references mtc_admin.pupil,
    createdAt datetimeoffset(3) default getutcdate() not null,
    updatedAt datetimeoffset(3) default getutcdate() not null
)
GO

CREATE TRIGGER [mtc_admin].[pupilGroupUpdatedAtTrigger]
    ON [mtc_admin].[pupilGroup]
    FOR UPDATE
    AS
BEGIN
    UPDATE [mtc_admin].[pupilGroup]
    SET updatedAt = GETUTCDATE()
    FROM inserted
    WHERE [pupilGroup].id = inserted.id
END


