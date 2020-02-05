CREATE NONCLUSTERED INDEX [idx_azure_recommended_pupil_group] ON [mtc_admin].[pupil] ([group_id]) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_azure_recommended_pupil_school
ON [mtc_admin].[pupil] (school_id) INCLUDE (attendanceId, checkComplete, createdAt, currentCheckId, dateOfBirth,
                                foreName, foreNameAlias, gender, group_id, isTestAccount,
                                lastName, lastNameAlias, middleNames,
                                pupilAgeReason_id, upn, urlSlug)  WITH (DROP_EXISTING = ON);
CREATE INDEX idx_pupil_currentCheckId ON [mtc_admin].pupil (currentCheckId) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupil_attendanceId ON [mtc_admin].pupil (attendanceId) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupil_schoolId ON [mtc_admin].pupil (school_id) WITH (DROP_EXISTING = ON)
DROP INDEX IF EXISTS [mtc_admin].[pupil].[pupil_job_id_index];
DROP INDEX IF EXISTS [mtc_admin].[pupil].[idx_azure_recommended_pupil_school];
DROP INDEX IF EXISTS IX_pupil_pupilAgeReason_id ON mtc_admin.pupil;
