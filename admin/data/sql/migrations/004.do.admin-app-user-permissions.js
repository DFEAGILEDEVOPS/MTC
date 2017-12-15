'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `GRANT SELECT,UPDATE,INSERT,EXECUTE ON schema::[mtc_admin] to [${config.Sql.Application.Username}];`
}
