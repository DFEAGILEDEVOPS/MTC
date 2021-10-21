DECLARE @defaultPassword NVARCHAR(MAX) = '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK'

UPDATE mtc_admin.[user] SET 
    identifier='teacher' + CAST(id as NVARCHAR), 
    passwordHash=@defaultPassword, 
    displayName=CAST(NEWID() AS VARCHAR(255))
