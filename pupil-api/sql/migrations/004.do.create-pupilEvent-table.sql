create table mtc_pupil.pupilEvent
(
	id bigint identity primary key,
	createdAt datetimeoffset default getutcdate() not null,
	updatedAt datetimeoffset default getutcdate() not null,
	version timestamp not null,
	data nvarchar(max) not null,
	pupileventType_id int not null
		constraint pupilEvent_pupilEventType_id_fk
			references mtc_pupil.pupilEventType
)
