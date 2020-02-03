IF NOT EXISTS (SELECT * FROM [mtc_admin].[checkStatus] WHERE code = 'STD')
    INSERT INTO [mtc_admin].[checkStatus]
    (code, description) VALUES ('STD', 'Started');
