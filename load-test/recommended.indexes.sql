
-- sql azure recommended...
CREATE NONCLUSTERED INDEX [idx_azure_recommended_pupil_group] ON [mtc_admin].[pupil] ([group_id]) WITH (ONLINE = ON)

--
IF NOT EXISTS (SELECT * FROM sys.indexes i
               WHERE i.object_ID=object_id('mtc_admin.pupil')
               AND name ='idx_azure_recommended_pupil_school')
    BEGIN
        --then the index doesn’t exist
        CREATE INDEX idx_azure_recommended_pupil_school
        ON [mtc_admin].[pupil] (school_id) INCLUDE (attendanceId, checkComplete, createdAt, currentCheckId, dateOfBirth,
                                        foreName, foreNameAlias, gender, group_id, isTestAccount, job_id,
                                        jwtSecret, jwtToken, lastName, lastNameAlias, middleNames,
                                        pupilAgeReason_id, pupilStatus_id, updatedAt, upn, urlSlug, version)
        ;
    END;


-- jon suggestion
create index idx_check_received_live_complete
	on mtc_admin.[check] (isLiveCheck, received, complete)
go

create index idx_check_received_live_failed
	on mtc_admin.[check] (isLiveCheck, received, processingFailed)
go

create index check_pupil_id_index
	on mtc_admin.[check] (pupil_id)
go

create index idx_pupil_currentCheckId
	on mtc_admin.pupil (currentCheckId)
go

create index idx_pupil_attendanceId
	on mtc_admin.pupil (attendanceId)
go

create index idx_pupil_schoolId
	on mtc_admin.pupil (school_id)
go


create index idx_check_checkStatus_id
	on mtc_admin.[check] (checkStatus_id)
go

create index idx_checkPin_pin_id
	on mtc_admin.[checkPin] (pin_id)
go



