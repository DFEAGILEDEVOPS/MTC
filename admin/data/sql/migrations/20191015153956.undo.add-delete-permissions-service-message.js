const config = require('../../../config')

module.exports.generateSql = () => {
  return `REVOKE DELETE ON [mtc_admin].[serviceMessage] FROM ${config.Sql.Application.Username}`
}
