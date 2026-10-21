'use strict'

const config = require('../../config')
module.exports.generateSql = function () {
  const user = config.Sql.FunctionsApp.Username
  return `GRANT SELECT, INSERT, UPDATE ON OBJECT::mtc_admin.dlqReconciliationRun TO [${user}];
    GRANT SELECT, INSERT, UPDATE ON OBJECT::mtc_admin.dlqReconciliationItem TO [${user}];
    GRANT SELECT ON OBJECT::mtc_results.checkResult TO [${user}];`
}