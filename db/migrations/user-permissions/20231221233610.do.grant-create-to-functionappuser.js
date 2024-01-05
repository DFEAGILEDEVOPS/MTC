'use strict'

const config = require('../../config')
module.exports.generateSql = function () {
  return `
    GRANT CONTROL ON DATABASE :: [${config.Sql.Database}] TO [${config.Sql.FunctionsApp.Username}];
    -- GRANT ALTER on schema::mtc_results to [${config.Sql.FunctionsApp.Username}];
    -- GRANT CREATE TABLE TO [${config.Sql.FunctionsApp.Username}];
    -- GRANT CREATE VIEW TO [${config.Sql.FunctionsApp.Username}];
  `
}
