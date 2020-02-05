DROP INDEX IF EXISTS [mtc_admin].[check].[check_pupil_id_index]
DROP INDEX IF EXISTS [mtc_admin].[check].[check_checkForm_id_index]
DROP INDEX IF EXISTS [mtc_admin].[check].[check_checkStatus_id_index]

CREATE INDEX check_receivedByServerAt_index ON mtc_admin.[check] (receivedByServerAt)
CREATE INDEX check_liveFlag_pupilId_index ON mtc_admin.[check] (isLiveCheck, pupil_id) INCLUDE (checkCode, checkStatus_id)

DROP INDEX IF EXISTS [mtc_admin].[check].[check_pupil_id_index]
DROP INDEX IF EXISTS [mtc_admin].[check].[checkConfig_check_id_index]
DROP INDEX IF EXISTS [mtc_admin].[check].[checkPin_pin_id_index]
