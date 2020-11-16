-- Add EXP to check status
DECLARE @expiredId Int = (SELECT id
                            FROM mtc_admin.checkStatus
                           WHERE code = 'EXP');

IF @expiredId IS NULL
    BEGIN
        INSERT INTO mtc_admin.checkStatus (code, description) VALUES ('EXP', 'Expired');
    END
