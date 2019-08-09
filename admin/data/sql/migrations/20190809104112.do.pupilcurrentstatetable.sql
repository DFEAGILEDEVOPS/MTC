create table mtc_admin.pupilCurrentState
(
	pupil_id int
		constraint pupilCurrentState_pk
			primary key nonclustered
		constraint pupilCurrentState_pupil_id_fk
			references mtc_admin.pupil,
	check_id int
		constraint pupilCurrentState_check_id_fk
			references mtc_admin.[check],
	restart_id int
		constraint pupilCurrentState_pupilRestart_id_fk
			references mtc_admin.pupilRestart,
	attendance_id int
		constraint pupilCurrentState_pupilAttendance_id_fk
			references mtc_admin.pupilAttendance
)
go

create unique index pupilCurrentState_check_id_uindex
	on mtc_admin.pupilCurrentState (check_id)
go

create unique index pupilCurrentState_restart_id_uindex
	on mtc_admin.pupilCurrentState (restart_id)
go

create unique index pupilCurrentState_attendance_id_uindex
	on mtc_admin.pupilCurrentState (attendance_id)
go

