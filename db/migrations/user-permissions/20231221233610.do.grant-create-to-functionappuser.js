'use strict'

const config = require('../../config')
module.exports.generateSql = function () {
  return `
    ALTER AUTHORIZATION ON SCHEMA::mtc_results to  [${config.Sql.FunctionsApp.Username}];
    GRANT CREATE TABLE TO [${config.Sql.FunctionsApp.Username}]
  `
}
