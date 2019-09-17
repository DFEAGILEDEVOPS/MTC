create table mtc_admin.pupilState
(
	pupil_id int
		constraint pupilState_pk
			primary key nonclustered
		constraint pupilState_pupil_id_fk
			references mtc_admin.pupil,
	check_id int
		constraint pupilState_check_id_fk
			references mtc_admin.[check],
	restart_id int
		constraint pupilState_pupilRestart_id_fk
			references mtc_admin.pupilRestart,
	attendance_id int
		constraint pupilState_pupilAttendance_id_fk
			references mtc_admin.pupilAttendance
)
go

create unique index pupilState_check_id_uindex
	on mtc_admin.pupilState (check_id)
go

create unique index pupilState_restart_id_uindex
	on mtc_admin.pupilState (restart_id)
go

create unique index pupilState_attendance_id_uindex
	on mtc_admin.pupilState (attendance_id)
go
