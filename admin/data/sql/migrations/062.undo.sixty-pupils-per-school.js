'use strict'

module.exports.generateSql = function () {
  return `DELETE [mtc_admin].[pupil] WHERE lastName LIKE 'School %'`
}
