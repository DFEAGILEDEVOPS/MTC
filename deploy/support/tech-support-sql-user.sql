
DECLARE @techSupportUser NVARCHAR(128) = '<tech_support_user>'

IF USER_ID(@techSupportUser) IS NOT NULL
  BEGIN
    PRINT 'user already exists'
    RETURN
  END

CREATE USER @techSupportUser WITH PASSWORD ='<password>', DEFAULT_SCHEMA=[mtc_admin];

GRANT CONNECT TO [@techSupportUser] AS [dbo]
GO

GRANT EXECUTE,SELECT ON SCHEMA::[mtc_admin] TO @techSupportUser AS [dbo]
GO

GRANT EXECUTE,SELECT ON SCHEMA::[mtc_results] TO @techSupportUser AS [dbo]
GO
