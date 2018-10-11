alter table [mtc_admin].[pupilRestart]
    add check_id int
    constraint [FK_pupilRestart_check_id_check_id] foreign key (check_id) references [mtc_admin].[check](id);

-- TODO make check_id not null when the old architecture code is removed.