'use strict'
const config = require('../../../config')

module.exports.generateSql = function () {
  return `GRANT DELETE ON [mtc_admin].[checkPin] TO [${config.Sql.Application.Username}]`
}
