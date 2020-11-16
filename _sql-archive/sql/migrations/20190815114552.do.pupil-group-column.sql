alter table mtc_admin.pupil
	add group_id int

alter table mtc_admin.pupil
	add constraint pupil_group_id_fk
		foreign key (group_id) references mtc_admin.[group]
