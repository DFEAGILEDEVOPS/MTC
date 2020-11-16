'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `REVOKE UNMASK TO [${config.Sql.Application.Username}]`
}
