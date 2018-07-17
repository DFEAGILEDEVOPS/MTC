create table mtc_pupil.pupilEventType
(
	id int identity primary key,
  	createdAt datetimeoffset default getutcdate() not null,
	updatedAt datetimeoffset default getutcdate() not null,
	version timestamp not null,
	title nvarchar(50) not null
)
