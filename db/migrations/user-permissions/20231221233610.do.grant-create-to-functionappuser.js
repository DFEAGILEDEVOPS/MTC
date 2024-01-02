'use strict'

const config = require('../../config')
const sqlConfig = require('../../')
module.exports.generateSql = function () {
  return `
    GRANT ALTER on schema::mtc_results to [${config.Sql.FunctionsApp.Username}];
    GRANT CREATE TABLE TO [${config.Sql.FunctionsApp.Username}];
  `
}
