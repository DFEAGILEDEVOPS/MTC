'use strict'

const config = require('../../config')

module.exports.generateSql = function () {
 return `REVOKE DELETE ON [mtc_admin].[serviceMessage] TO [${config.Sql.Application.Username}] AS [dbo]`
}
