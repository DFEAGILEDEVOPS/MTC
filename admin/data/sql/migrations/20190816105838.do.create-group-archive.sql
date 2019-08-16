create table mtc_admin.[z_group_archive]
(
    id int,
    name nvarchar(50) not null,
    isDeleted bit default 0 not null,
    createdAt datetimeoffset(3) default getutcdate() not null,
    updatedAt datetimeoffset(3) default getutcdate() not null,
    school_id int not null
)
go
