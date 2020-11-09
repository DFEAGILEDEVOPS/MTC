create table mtc_admin.pupilStatusCode
(
	id int identity
		constraint PK_pupilStatusCode
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	description nvarchar(50) not null,
	code char(3) not null
		constraint pupilStatusCode_code_uindex
			unique
)
