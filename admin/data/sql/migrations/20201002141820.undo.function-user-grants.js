'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `
  REVOKE SELECT, INSERT, UPDATE, EXECUTE ON SCHEMA::[mtc_admin] to [${config.Sql.FunctionsApp.Username}];
  REVOKE SELECT, INSERT ON schema::[mtc_results] to [${config.Sql.FunctionsApp.Username}];
  REVOKE DELETE ON OBJECT::[mtc_admin].[checkPin] to [${config.Sql.FunctionsApp.Username}];
  `
}
