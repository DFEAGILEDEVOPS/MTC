'use strict'

const config = require('../../config')
module.exports.generateSql = function () {
  return `REVOKE CREATE TABLE TO [${config.Sql.FunctionsApp.Username}]`
}
