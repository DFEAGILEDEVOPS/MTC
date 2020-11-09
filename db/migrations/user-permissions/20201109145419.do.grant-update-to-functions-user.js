'use strict'

const config = require('../../config')
module.exports.generateSql = function () {
  return `GRANT UPDATE ON OBJECT::mtc_results.checkResult TO [${config.Sql.FunctionsApp.Username}] AS [dbo];`
}
