'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `
  REVOKE SELECT ON object::[mtc_admin].[check].[id] to [${config.Sql.ResultsSync.Username}];
  REVOKE INSERT ON schema::[mtc_results] to [${config.Sql.ResultsSync.Username}];
  `
}
