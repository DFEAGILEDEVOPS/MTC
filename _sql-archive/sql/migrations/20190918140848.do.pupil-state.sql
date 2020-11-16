alter table mtc_admin.pupil
	add currentCheckId int

alter table mtc_admin.pupil
	add checkComplete bit
	constraint DF_checkComplete_Default default (0)

alter table mtc_admin.pupil
	add restartAvailable bit
	constraint DF_restartAvailable_Default default (0)

alter table mtc_admin.pupil
	add attendanceId int

alter table mtc_admin.pupil
	add constraint pupil_check_id_fk
		foreign key (currentCheckId) references mtc_admin.[check]

alter table mtc_admin.pupil
	add constraint pupil_attendanceCode_id_fk
		foreign key (attendanceId) references mtc_admin.attendanceCode
