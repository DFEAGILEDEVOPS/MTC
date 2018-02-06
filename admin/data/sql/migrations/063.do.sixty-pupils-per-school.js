'use strict'

const R = require('ramda')
const config = require('../../../config')
const moment = require('moment')

module.exports.generateSql = function () {
  const targetEnvironments = ['Azure-UAT', 'Azure-Feb-Trial', 'Local-Dev']
  if (R.contains(config.Environment, targetEnvironments)) {
    let foreName, lastName, gender, dateOfBirth, upn
    const insertStatements = []
    const pupilPerSchoolCount = 60
    const schoolCount = 5
    let upnBase = 1
    for (let schoolId = 1; schoolId <= schoolCount; schoolId++) {
      for (let pupilIndex = 0; pupilIndex < pupilPerSchoolCount; pupilIndex++) {
        const upnNumber = upnBase.toString().padStart(11, '0')
        upn = `A${upnNumber}A`
        upnBase++
        foreName = `Pupil ${pupilIndex + 1}`
        lastName = `School ${schoolId}`
        gender = 'M'
        dateOfBirth = moment('2000-01-01').add(pupilIndex, 'days').format('YYYY-MM-DD').toString()
        insertStatements.push(`INSERT [mtc_admin].[pupil] (school_id, foreName, lastName, gender, dateOfBirth, upn) 
        VALUES (${schoolId}, '${foreName}', '${lastName}', '${gender}', '${dateOfBirth}', '${upn}')`)
      }
    }
    return insertStatements.join('\n')
  } else {
    return `SELECT 'This migration is not being run in ${config.Environment}`
  }
}
