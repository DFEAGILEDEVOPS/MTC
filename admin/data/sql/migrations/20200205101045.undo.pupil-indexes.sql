DROP INDEX IF EXISTS [mtc_admin].[pupil].[idx_azure_recommended_pupil_group]
DROP INDEX IF EXISTS [mtc_admin].[pupil].[idx_azure_recommended_pupil_school]
DROP INDEX IF EXISTS [mtc_admin].[pupil].[idx_pupil_currentCheckId]
DROP INDEX IF EXISTS [mtc_admin].[pupil].[idx_pupil_attendanceId]
DROP INDEX IF EXISTS [mtc_admin].[pupil].[idx_pupil_schoolId]

CREATE INDEX pupil_job_id_index ON mtc_admin.pupil (job_id) WITH (DROP_EXISTING = ON)
