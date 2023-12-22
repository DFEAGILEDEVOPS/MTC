'use strict'

const config = require('../../config')
module.exports.generateSql = function () {
  return `
    -- ALTER AUTHORIZATION ON SCHEMA::mtc_results to  [WHO? dbo?];
    REVOKE CREATE TABLE TO [${config.Sql.FunctionsApp.Username}]
  `
}
