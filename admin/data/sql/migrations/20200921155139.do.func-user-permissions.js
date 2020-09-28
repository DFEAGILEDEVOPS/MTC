'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `
  GRANT SELECT, INSERT, UPDATE, EXECUTE ON schema::[mtc_admin] to [${config.Sql.FunctionsApp.Username}];
  GRANT SELECT, INSERT ON schema::[mtc_results] to [${config.Sql.FunctionsApp.Username}];
  `
}
