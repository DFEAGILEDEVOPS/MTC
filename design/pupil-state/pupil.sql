alter table mtc_admin.pupil
	add currentCheckId int
go

alter table mtc_admin.pupil
	add checkComplete bit default 0
go

-- not required, as we can include against check via currentCheckId reference
/*
alter table mtc_admin.pupil
	add checkReceived bit default 0
go
*/

alter table mtc_admin.pupil
	add restartActive bit default 0
go

alter table mtc_admin.pupil
	add attendanceId int
go

alter table mtc_admin.pupil
	add constraint pupil_check_id_fk
		foreign key (currentCheckId) references mtc_admin.[check]
go

alter table mtc_admin.pupil
	add constraint pupil_attendanceCode_id_fk
		foreign key (attendanceId) references mtc_admin.attendanceCode
go

