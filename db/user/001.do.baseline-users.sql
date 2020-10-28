-- TODO convert to JS and include login creation with passwords

/****** Object:  User [TechSupportUser]    Script Date: 27/10/2020 17:45:50 ******/
CREATE USER [TechSupportUser] FOR LOGIN [TechSupportUser] WITH DEFAULT_SCHEMA=[mtc_admin]
GO
/****** Object:  User [mtcAdminUser]    Script Date: 27/10/2020 17:45:50 ******/
CREATE USER [mtcAdminUser] FOR LOGIN [mtcAdminUser] WITH DEFAULT_SCHEMA=[mtc_admin]
GO
/****** Object:  User [functionsUser]    Script Date: 27/10/2020 17:45:50 ******/
CREATE USER [functionsUser] FOR LOGIN [functionsUser] WITH DEFAULT_SCHEMA=[mtc_admin]
GO

