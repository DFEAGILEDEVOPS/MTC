'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `REVOKE SELECT,UPDATE,INSERT,EXECUTE ON schema::[mtc_admin] to [${config.Sql.Application.Username}];`
}
