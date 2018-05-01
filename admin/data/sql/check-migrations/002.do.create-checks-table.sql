create table mtc_check.readyChecks
(
	id bigint identity
		primary key,
	createdAt datetimeoffset default getutcdate() not null,
	updatedAt datetimeoffset default getutcdate() not null,
	version timestamp not null,
	pupilPin char(5) not null,
	schoolPin char(8) not null,
	checkData nvarchar(max) not null,
	obtainedAt datetimeoffset
)
go

create unique index readyChecks__pinIndex
	on mtc_check.readyChecks (pupilPin, schoolPin)
go
