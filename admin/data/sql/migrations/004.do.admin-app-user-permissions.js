'use strict'

const config = require('../../../config')

const tables = [
  'settingsLog',
  'pupilLogonEvent',
  'pupilFeedback',
  'pupilAttendance',
  'hdf',
  'adminLogonEvent',
  'check',
  'user',
  'pupil',
  'checkForm',
  'school',
  'role',
  'checkWindow',
  'attendanceCode',
  'settings'
]

const permissions = []

tables.forEach((table) => {
  permissions.push(`GRANT SELECT, INSERT, UPDATE ON OBJECT::[mtc_admin].[${table}] TO ${config.Sql.Application.Username}`)
})

module.exports.generateSql = function () {
  console.log(permissions.join(';'))
  // return permissions.join(';')
  return `GRANT SELECT,UPDATE,INSERT,EXECUTE ON schema::[mtc_admin] to [${config.Sql.Application.Username}];`
}
