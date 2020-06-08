'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `GRANT SELECT,EXECUTE ON schema::[mtc_admin] to [${config.Sql.TechSupport.Username}];`
}
