'use strict'

const config = require('../../config')
module.exports.generateSql = function () {
  return `GRANT UPDATE, DELETE ON OBJECT::mtc_results.psychometricReport TO [${config.Sql.FunctionsApp.Username}] AS [dbo];`
}
