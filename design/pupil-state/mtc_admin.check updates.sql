alter table mtc_admin.[check]
	add received bit default 0 not null
go

alter table mtc_admin.[check]
	add complete bit default 0 not null
go

alter table mtc_admin.[check]
	add completedAt datetimeoffset(3)
go

alter table mtc_admin.[check]
	add processingFailed bit default 0 not null
go

alter table mtc_admin.[check]
	add pupilRestart_id int
go

alter table mtc_admin.[check]
	add constraint check_pupilRestart_id_fk
		foreign key (pupilRestart_id) references mtc_admin.pupilRestart
go

