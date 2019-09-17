create table mtc_admin.check2
(
	id int identity
		constraint check2_pk
			primary key nonclustered,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	pupil_id int not null
		constraint check2_pupil_id_fk
			references mtc_admin.pupil,
	checkCode uniqueidentifier not null,
	checkWindow_id int not null
		constraint check2_checkWindow_id_fk
			references mtc_admin.checkWindow,
	checkForm_id int not null
		constraint check2_checkForm_id_fk
			references mtc_admin.checkForm,
	receivedByServerAt datetimeoffset(3),
	submittedCheckReceived bit default 0 not null, -- or NULL check on recievedByServerAt?
	isLiveCheck bit default 0 not null,
  isVoid bit default 0 not null,
  restartId int,
  complete bit default 0 not null,
  processingFailed bit default 0 not null,
  completedAt datetimeoffset(3)
)
go

alter table mtc_admin.check2
	add constraint check2_pupilRestartCode_id_fk
		foreign key (restartId) references mtc_admin.pupilRestartCode
go
