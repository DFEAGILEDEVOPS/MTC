'use strict'

const config = require('../../config')
module.exports.generateSql = function () {
  return `
    -- The Migrations are run by the migrations user, which cannot give AUTHORISATION ownership of the mtc_results
    -- schema back to the Migration user due the runtime context.  To work around this the migration user is granted CONTROL
    -- permissions in the UP migration.
    REVOKE CREATE TABLE TO [${config.Sql.FunctionsApp.Username}]
  `
}
