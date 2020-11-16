create table mtc_admin.sessions
(
	sid varchar(255) not null
		constraint pk_sessions
			primary key,
	expires datetimeoffset not null,
	sess nvarchar(max)
)
