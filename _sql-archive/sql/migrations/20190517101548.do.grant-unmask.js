'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `GRANT UNMASK TO [${config.Sql.Application.Username}]`
}
