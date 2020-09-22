'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `
  GRANT SELECT ON object::[mtc_admin].[check] (id) to [${config.Sql.ResultsSync.Username}];
  GRANT INSERT ON schema::[mtc_results] to [${config.Sql.ResultsSync.Username}];
  `
}
