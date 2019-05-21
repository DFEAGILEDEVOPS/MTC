create table mtc_admin.pupilLogonEvent
(
	id int identity
		primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	pupil_id int
		constraint FK_pupilLogonEvent_pupil_id
			references mtc_admin.pupil,
	isAuthenticated bit not null,
	pupilPin nvarchar(50) not null,
	schoolPin nvarchar(50) not null,
	httpStatusCode smallint,
	httpErrorMessage nvarchar(max)
)
