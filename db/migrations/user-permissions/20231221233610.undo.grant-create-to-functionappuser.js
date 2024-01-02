'use strict'

const config = require('../../config')
module.exports.generateSql = function () {
  return `
    ALTER AUTHORIZATION ON SCHEMA::mtc_results to [${config.Sql.Migrator.Username}];
    REVOKE CREATE TABLE TO [${config.Sql.FunctionsApp.Username}]
  `
}
