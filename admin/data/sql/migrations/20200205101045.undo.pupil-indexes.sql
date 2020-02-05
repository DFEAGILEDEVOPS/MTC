DROP INDEX IF EXISTS [mtc_admin].[pupil].[pupil_group_index]
DROP INDEX IF EXISTS [mtc_admin].[pupil].[pupil_currentCheckId_index]
DROP INDEX IF EXISTS [mtc_admin].[pupil].[pupil_attendanceId_index]

CREATE INDEX pupil_job_id_index ON mtc_admin.pupil (job_id)
