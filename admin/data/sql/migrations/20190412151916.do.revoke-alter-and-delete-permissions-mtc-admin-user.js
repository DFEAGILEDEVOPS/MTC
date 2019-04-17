'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `REVOKE ALTER, DELETE ON [mtc_admin].[pupil] TO ${config.Sql.Application.Username}`
}
