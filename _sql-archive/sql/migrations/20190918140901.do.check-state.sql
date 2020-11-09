alter table mtc_admin.[check]
	add received bit not null
  constraint DF_received_Default default 0

alter table mtc_admin.[check]
	add complete bit not null
  constraint DF_complete_Default default 0

alter table mtc_admin.[check]
	add completedAt datetimeoffset(3)

alter table mtc_admin.[check]
	add processingFailed bit not null
  constraint DF_processingFailed_Default default 0

alter table mtc_admin.[check]
	add pupilRestart_id int

alter table mtc_admin.[check]
	add constraint check_pupilRestart_id_fk
		foreign key (pupilRestart_id) references mtc_admin.pupilRestart
