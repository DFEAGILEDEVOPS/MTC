'use strict'

const config = require('../../config')

module.exports.generateSql = function () {
  return `GRANT SELECT ON SCHEMA::[mtc_results] TO [${config.Sql.TechSupport.Username}] AS [dbo]`
}
