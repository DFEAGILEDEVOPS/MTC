
create table mtc_admin.z_pupilGroup_archive
(
    id int identity primary key,
    group_id  int not null,
    pupil_id  int not null,
    createdAt datetimeoffset(3) default getutcdate() not null,
    updatedAt datetimeoffset(3) default getutcdate() not null
)
