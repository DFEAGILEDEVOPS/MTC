/*******************
This script is used in Azure DevOps to create a tech support account in the relevant environments
Tokens are auto replaced during execution for secure values
*******************/

IF USER_ID('$(TechSupport.Sql.Username)') IS NOT NULL
  BEGIN
    PRINT 'user already exists'
    RETURN
  END

CREATE USER $(TechSupport.Sql.Username) WITH PASSWORD ='$(TechSupport.Sql.Password)', DEFAULT_SCHEMA=[mtc_admin];

GRANT CONNECT TO $(TechSupport.Sql.Username) AS [dbo]
GO

GRANT EXECUTE,SELECT ON SCHEMA::[mtc_admin] TO $(TechSupport.Sql.Username) AS [dbo]
GO

GRANT EXECUTE,SELECT ON SCHEMA::[mtc_results] TO $(TechSupport.Sql.Username) AS [dbo]
GO
