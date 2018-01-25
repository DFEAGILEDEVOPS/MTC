const config = require('../../../config')

module.exports.generateSql = () => {
  return `REVOKE DELETE ON [mtc_admin].[pupilAttendance] FROM ${config.Sql.Application.Username}`
}
