'use strict'
const config = require('../../config')

module.exports.generateSql = function () {
  return `REVOKE DELETE ON OBJECT::mtc_admin.hdf TO [${config.Sql.Application.Username}] AS [dbo];`
}
