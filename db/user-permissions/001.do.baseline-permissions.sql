
-- functionsUser
GRANT CONNECT TO [functionsUser] AS [dbo]
GO
GRANT CREATE TABLE TO [functionsUser] AS [dbo]
GO
GRANT CONTROL ON SCHEMA::[mtc_census_import] TO [functionsUser] AS [dbo]
GO
GRANT EXECUTE, INSERT, SELECT, UPDATE ON SCHEMA::[mtc_admin] TO [functionsUser] AS [dbo]
GO
GRANT INSERT, SELECT ON SCHEMA::[mtc_results] TO [functionsUser] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[checkPin] TO [functionsUser] AS [dbo]
GO

-- mtcAdminUser
GRANT CONNECT TO [mtcAdminUser] AS [dbo]
GO
GRANT UNMASK TO [mtcAdminUser] AS [dbo]
GO
GRANT EXECUTE, INSERT, SELECT, UPDATE ON SCHEMA::[mtc_admin] TO [mtcAdminUser] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[anomalyReportCache] TO [mtcAdminUser] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[checkFormWindow] TO [mtcAdminUser] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[checkPin] TO [mtcAdminUser] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[group] TO [mtcAdminUser] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[psychometricianReportCache] TO [mtcAdminUser] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[pupilAccessArrangements] TO [mtcAdminUser] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[pupilAgeReason] TO [mtcAdminUser] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[pupilAttendance] TO [mtcAdminUser] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[pupilResultsDiagnosticCache] TO [mtcAdminUser] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[serviceMessage] TO [mtcAdminUser] AS [dbo]
GO

-- TechSupportUser
GRANT CONNECT TO [TechSupportUser] AS [dbo]
GO
GRANT EXECUTE,SELECT ON SCHEMA::[mtc_admin] TO [TechSupportUser] AS [dbo]
GO
