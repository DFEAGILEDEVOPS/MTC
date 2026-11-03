'use strict'

const config = require('../../config')
module.exports.generateSql = function () {
  const user = config.Sql.FunctionsApp.Username
  return `REVOKE SELECT, INSERT, UPDATE ON OBJECT::mtc_admin.dlqReconciliationRun FROM [${user}];
    REVOKE SELECT, INSERT, UPDATE ON OBJECT::mtc_admin.dlqReconciliationItem FROM [${user}];`
}