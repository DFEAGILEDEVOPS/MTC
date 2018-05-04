create table mtc_pupil.preparedCheck
(
	id bigint identity
		primary key,
	createdAt datetimeoffset default getutcdate() not null,
	updatedAt datetimeoffset default getutcdate() not null,
	version timestamp not null,
	pupilPin char(5) not null,
	schoolPin char(8) not null,
	checkCode uniqueidentifier not null,
	checkData nvarchar(max) not null,
	authenticatedAt datetimeoffset,
	startedAt datetimeoffset
)
go

create unique index preparedCheck__pinIndex
	on mtc_pupil.preparedCheck (pupilPin, schoolPin)
go

create unique index preparedCheck_checkCode_uindex
	on mtc_pupil.preparedCheck (checkCode)
go
