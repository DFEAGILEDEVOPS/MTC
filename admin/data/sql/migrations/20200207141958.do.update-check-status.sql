-- Remove EXP from check status
declare @expiredId Int = (select id from mtc_admin.checkStatus WHERE code = 'EXP');
declare @newId Int = (select id from mtc_admin.checkStatus WHERE code = 'NEW');

IF @expiredId IS NOT NULL AND @newId IS NOT NULL
BEGIN
    UPDATE mtc_admin.[check]
        set checkStatus_id = @newId
    WHERE
        checkStatus_id = @expiredId;

    DELETE FROM mtc_admin.checkStatus where code = 'EXP';
END
