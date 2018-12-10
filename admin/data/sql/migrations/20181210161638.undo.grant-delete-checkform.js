const config = require('../../../config')

module.exports.generateSql = () => {
  return `REVOKE DELETE ON [mtc_admin].[checkForm] TO ${config.Sql.Application.Username}`
}
