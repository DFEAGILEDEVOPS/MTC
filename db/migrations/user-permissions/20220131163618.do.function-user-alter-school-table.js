'use strict'

const config = require('../../config')
module.exports.generateSql = function () {
  return `GRANT ALTER ON [mtc_admin].[school] TO [${config.Sql.FunctionsApp.Username}] AS [dbo];`
}
