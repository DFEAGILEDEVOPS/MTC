'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  if (config.Environment === ('Azure-UAT' || 'Azure-Feb-Trial')) {
    let schoolId, foreName, lastName, gender, dateOfBirth, upn
    const insertStatements = []
    const pupilPerSchoolCount = 60
    for (let pupilIndex = 0; pupilIndex < pupilPerSchoolCount; pupilIndex++) {
      // TODO populate variables
      insertStatements.push(`INSERT [mtc_admin].[pupil] (school_id, foreName, lastName, gender, dateOfBirth, upn) 
      VALUES (${schoolId}, '${foreName}', '${lastName}', '${gender}', '${dateOfBirth}', '${upn}')`)
    }
    return insertStatements.join('\n')
  } else {
    return `SELECT 'This migration is not being run in ${config.Environment}`
  }
}
