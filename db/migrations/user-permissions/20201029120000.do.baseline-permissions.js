'use strict'

const config = require('../../config')

const functionsUserSql = `
GRANT CONNECT TO [${config.Sql.FunctionsApp.Username}] AS [dbo]
GO
GRANT CREATE TABLE TO [${config.Sql.FunctionsApp.Username}] AS [dbo]
GO
GRANT CONTROL ON SCHEMA::[mtc_census_import] TO [${config.Sql.FunctionsApp.Username}] AS [dbo]
GO
-- TODO review approach, and potentially be more granular about insert, execute and update
GRANT EXECUTE, INSERT, SELECT, UPDATE ON SCHEMA::[mtc_admin] TO [${config.Sql.FunctionsApp.Username}] AS [dbo]
GO
GRANT INSERT, SELECT ON SCHEMA::[mtc_results] TO [${config.Sql.FunctionsApp.Username}] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[checkPin] TO [${config.Sql.FunctionsApp.Username}] AS [dbo]
GO
`

const adminUserSql = `
GRANT CONNECT TO [${config.Sql.Application.Username}] AS [dbo]
GO
GRANT UNMASK TO [${config.Sql.Application.Username}] AS [dbo]
GO
GRANT EXECUTE, INSERT, SELECT, UPDATE ON SCHEMA::[mtc_admin] TO [${config.Sql.Application.Username}] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[anomalyReportCache] TO [${config.Sql.Application.Username}] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[checkFormWindow] TO [${config.Sql.Application.Username}] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[checkPin] TO [${config.Sql.Application.Username}] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[group] TO [${config.Sql.Application.Username}] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[psychometricianReportCache] TO [${config.Sql.Application.Username}] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[pupilAccessArrangements] TO [${config.Sql.Application.Username}] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[pupilAgeReason] TO [${config.Sql.Application.Username}] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[pupilAttendance] TO [${config.Sql.Application.Username}] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[pupilResultsDiagnosticCache] TO [${config.Sql.Application.Username}] AS [dbo]
GO
GRANT DELETE ON [mtc_admin].[serviceMessage] TO [${config.Sql.Application.Username}] AS [dbo]
GO
`

const supportUserSql = `
GRANT CONNECT TO [${config.Sql.TechSupport.Username}] AS [dbo]
GO
GRANT EXECUTE,SELECT ON SCHEMA::[mtc_admin] TO [${config.Sql.TechSupport.Username}] AS [dbo]
GO
`

module.exports.generateSql = function () {
  return [functionsUserSql, adminUserSql, supportUserSql].join('\n')
}
