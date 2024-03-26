'use strict'

const config = require('../../config')

module.exports.generateSql = function () {
  return `
    ALTER DATABASE [${config.Sql.Database}]
    SET COMPATIBILITY_LEVEL = 150;
    `
}
