const config = require('../../../config')

module.exports.generateSql = () => {
  return `REVOKE DELETE ON [mtc_admin].[checkFormWindow] FROM ${config.Sql.Application.Username}`
}
