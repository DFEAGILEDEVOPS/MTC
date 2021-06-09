'use strict'

const config = require('../../config')

module.exports.generateSql = function () {
  return `REVOKE SELECT ON SCHEMA::[mtc_results] TO [${config.Sql.TechSupport.Username}] AS [dbo]`
}
