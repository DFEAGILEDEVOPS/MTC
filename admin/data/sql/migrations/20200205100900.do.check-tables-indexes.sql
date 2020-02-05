-- check
CREATE INDEX check_pupil_id_index ON mtc_admin.[check] (pupil_id) WITH (DROP_EXISTING = ON)
CREATE INDEX check_checkForm_id_index ON mtc_admin.[check] (checkForm_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_check_checkStatus_id ON mtc_admin.[check] (checkStatus_id) WITH (DROP_EXISTING = ON)
-- not recommended due to high activity
DROP INDEX IF EXISTS [mtc_admin].[check].[check_receivedByServerAt_index];
DROP INDEX IF EXISTS [mtc_admin].[check].[check_liveFlag_pupilId_index];
DROP INDEX IF EXISTS [mtc_admin].[check].[check_checkWindow_id_index];
-- heavily used lookup
CREATE INDEX [IX_check_pupil_id] ON [mtc-load].[mtc_admin].[check] ([pupil_id]) INCLUDE ([checkForm_id]) WITH (DROP_EXISTING = ON)

-- check config
CREATE INDEX idx_checkConfig_check_id ON mtc_admin.[checkConfig] (check_id) WITH (DROP_EXISTING = ON)

-- checkPin
CREATE INDEX idx_checkPin_pin_id ON mtc_admin.[checkPin] (pin_id) WITH (DROP_EXISTING = ON)
