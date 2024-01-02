'use strict'

const config = require('../../config')
module.exports.generateSql = function () {
  return `
    -- Give ownership of the schema to the Functions user so they can create tables and views securely.
    ALTER AUTHORIZATION ON SCHEMA::mtc_results to  [${config.Sql.FunctionsApp.Username}];
    -- Give permission for the migrator user to do anything.
    GRANT CONTROL ON SCHEMA::mtc_results to [${config.Sql.Migrator.Username}];
    -- Still need to grant specific privileges to the Functions user.
    GRANT CREATE TABLE TO [${config.Sql.FunctionsApp.Username}]
  `
}
