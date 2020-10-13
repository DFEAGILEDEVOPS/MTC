'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `
  GRANT SELECT, INSERT, UPDATE, EXECUTE ON SCHEMA::[mtc_admin] to [${config.Sql.FunctionsApp.Username}];
  GRANT SELECT, INSERT ON SCHEMA::[mtc_results] to [${config.Sql.FunctionsApp.Username}];
  GRANT DELETE ON OBJECT::[mtc_admin].[checkPin] to [${config.Sql.FunctionsApp.Username}];
  `
}
