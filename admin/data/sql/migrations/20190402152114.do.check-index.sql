CREATE NONCLUSTERED INDEX [check_liveFlag_pupilId_index] ON
[mtc_admin].[check] ([isLiveCheck], [pupil_id])
INCLUDE ([checkCode], [checkStatus_id]) WITH (ONLINE = ON)
