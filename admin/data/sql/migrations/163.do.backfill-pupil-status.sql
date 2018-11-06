declare @statusId int;

-- Set pupil status for those pupils who have never been allocated any checks
set @statusId = (select id from [mtc_admin].[pupilStatus] where code = 'UNALLOC');

UPDATE [mtc_admin].[pupil]
SET pupilStatus_id = @statusId
FROM [mtc_admin].[pupil] p
       LEFT JOIN [mtc_admin].[check] chk ON (p.id = chk.pupil_id)
WHERE chk.id IS NULL;



-- Set the pupil status for those pupils who have been allocated a check but have never logged in
set @statusId = (select id from [mtc_admin].[pupilStatus] where code = 'ALLOC');

UPDATE [mtc_admin].[pupil]
SET pupilStatus_id = @statusId
FROM [mtc_admin].[pupil] p
       LEFT JOIN [mtc_admin].[check] chk ON (p.id = chk.pupil_id)
WHERE chk.isLiveCheck = 1
AND chk.id IS NULL;

-- Set the pupil status for pupils who have been allocated but not logged in
-- statusId is still ALLOC
UPDATE [mtc_admin].[pupil]
SET pupilStatus_id = @statusId
FROM [mtc_admin].[pupil] p
       LEFT JOIN [mtc_admin].[check] chk ON (p.id = chk.pupil_id)
       INNER JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
WHERE chkStatus.code = 'NEW';


-- Set pupil status for those pupils who have have logged in to their check
set @statusId = (select id from [mtc_admin].[pupilStatus] where code = 'LOGGED_IN');

UPDATE [mtc_admin].[pupil]
SET pupilStatus_id = @statusId
FROM [mtc_admin].[pupil] p
       INNER JOIN [mtc_admin].[check] chk ON (p.id = chk.pupil_id)
       INNER JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
WHERE chkStatus.code = 'COL'
AND   chk.isLiveCheck = 1;



-- Set pupil status for those who have have started a check
set @statusId = (select id from [mtc_admin].[pupilStatus] where code = 'STARTED');

UPDATE [mtc_admin].[pupil]
SET pupilStatus_id = @statusId
FROM [mtc_admin].[pupil] p
       INNER JOIN [mtc_admin].[check] chk ON (p.id = chk.pupil_id)
       INNER JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
WHERE chkStatus.code = 'STD'
  AND   chk.isLiveCheck = 1;



-- Update the pupil status for pupils who have completed a check
set @statusId = (select id from [mtc_admin].[pupilStatus] where code = 'COMPLETED');

UPDATE [mtc_admin].[pupil]
SET pupilStatus_id = @statusId
FROM [mtc_admin].[pupil] p
    INNER JOIN [mtc_admin].[check] chk ON (p.id = chk.pupil_id)
    INNER JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
WHERE chkStatus.code = 'CMP'
AND   chk.isLiveCheck = 1;


-- Set pupil status for those not taking the check
set @statusId = (select id from [mtc_admin].[pupilStatus] where code = 'NOT_TAKING');

UPDATE [mtc_admin].[pupil]
SET pupilStatus_id = @statusId
FROM [mtc_admin].[pupil] p
    INNER JOIN [mtc_admin].[pupilAttendance] pa ON (p.id = pa.pupil_id)
WHERE pa.isDeleted = 0;


-- Set any pupils with an unconsumed restart to UNALLOC, so they can be allocated a new check
set @statusId = (select id from [mtc_admin].[pupilStatus] where code = 'UNALLOC');

UPDATE [mtc_admin].[pupil]
SET pupilStatus_id = @statusId
FROM [mtc_admin].[pupil] p
      INNER JOIN [mtc_admin].[pupilRestart] pr ON (p.id = pr.pupil_id)
WHERE
      pr.check_id IS NULL
AND   pr.isDeleted = 0;

-- set any pupils who only have familiarisation checks to be UNALLOC
set @statusId = (select id from [mtc_admin].[pupilStatus] where code = 'UNALLOC');

UPDATE [mtc_admin].[pupil]
SET pupilStatus_id = @statusId
WHERE pupilStatus_id IS NULL;

