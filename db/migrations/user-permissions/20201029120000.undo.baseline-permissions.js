'use strict'

const config = require('../../config')

const functionsUserSql = `
REVOKE CONNECT TO [${config.Sql.FunctionsApp.Username}] AS [dbo]
GO
REVOKE CREATE TABLE TO [${config.Sql.FunctionsApp.Username}] AS [dbo]
GO
REVOKE CONTROL ON SCHEMA::[mtc_census_import] TO [${config.Sql.FunctionsApp.Username}] AS [dbo]
GO

REVOKE EXECUTE, INSERT, SELECT, UPDATE ON SCHEMA::[mtc_admin] TO [${config.Sql.FunctionsApp.Username}] AS [dbo]
GO
REVOKE INSERT, SELECT ON SCHEMA::[mtc_results] TO [${config.Sql.FunctionsApp.Username}] AS [dbo]
GO
REVOKE DELETE ON [mtc_admin].[checkPin] TO [${config.Sql.FunctionsApp.Username}] AS [dbo]
GO
`

const adminUserSql = `
REVOKE CONNECT TO [${config.Sql.Application.Username}] AS [dbo]
GO
REVOKE UNMASK TO [${config.Sql.Application.Username}] AS [dbo]
GO
REVOKE EXECUTE, INSERT, SELECT, UPDATE ON SCHEMA::[mtc_admin] TO [${config.Sql.Application.Username}] AS [dbo]
GO
REVOKE DELETE ON [mtc_admin].[anomalyReportCache] TO [${config.Sql.Application.Username}] AS [dbo]
GO
REVOKE DELETE ON [mtc_admin].[checkFormWindow] TO [${config.Sql.Application.Username}] AS [dbo]
GO
REVOKE DELETE ON [mtc_admin].[checkPin] TO [${config.Sql.Application.Username}] AS [dbo]
GO
REVOKE DELETE ON [mtc_admin].[group] TO [${config.Sql.Application.Username}] AS [dbo]
GO
REVOKE DELETE ON [mtc_admin].[psychometricianReportCache] TO [${config.Sql.Application.Username}] AS [dbo]
GO
REVOKE DELETE ON [mtc_admin].[pupilAccessArrangements] TO [${config.Sql.Application.Username}] AS [dbo]
GO
REVOKE DELETE ON [mtc_admin].[pupilAgeReason] TO [${config.Sql.Application.Username}] AS [dbo]
GO
REVOKE DELETE ON [mtc_admin].[pupilAttendance] TO [${config.Sql.Application.Username}] AS [dbo]
GO
REVOKE DELETE ON [mtc_admin].[pupilResultsDiagnosticCache] TO [${config.Sql.Application.Username}] AS [dbo]
GO
REVOKE DELETE ON [mtc_admin].[serviceMessage] TO [${config.Sql.Application.Username}] AS [dbo]
GO
`
const techSupportUserSql = `
REVOKE CONNECT TO [${config.Sql.TechSupport.Username}] AS [dbo]
GO
REVOKE EXECUTE,SELECT ON SCHEMA::[mtc_admin] TO [${config.Sql.TechSupport.Username}] AS [dbo]
GO
`
module.exports.generateSql = function () {
 return [functionsUserSql, adminUserSql, techSupportUserSql].join('\n')
}
