'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `GRANT ALTER, DELETE ON [mtc_admin].[pupil] TO ${config.Sql.Application.Username}`
}
