'use strict'

const moment = require('moment')
const upnService = require('../../../services/upn.service')
const pupilsData = require('../../fixtures/dummy-users.json')

function generatePupils () {
  const pupils = []
  const baseUpn = '801200001'
  let pupilIdx = 1
  // TODO load in actual example schools or add them in this migration and add teachers afterward?
  const schools = [2, 3, 4, 5, 6]
  const numPupils = [15, 30, 30, 60, 90]
  for (let i = 0; i < schools.length; i++) {
    let school = schools[i]
    let pupilsRequired = numPupils[i]

    for (let j = 0; j < pupilsRequired; j++) {
      let serial = pupilIdx.toString().padStart(3, 0)
      const pupil = {
        school: school,
        foreName: pupilsData[j].foreName,
        middleNames: randomMiddleName(),
        lastName: pupilsData[j].lastName,
        gender: Math.round(Math.random()) === 1 ? 'F' : 'M',
        dob: randomDob(),
        upn: upnService.calculateCheckLetter(baseUpn + serial) + baseUpn + serial
      }
      pupilIdx += 1
      const sql = `INSERT INTO [mtc_admin].pupil (school_id, foreName, middleNames, lastName, gender, dateOfBirth, upn, speechSynthesis, isTestAccount) VALUES (${pupil.school}, '${pupil.foreName}', '${pupil.middleNames}', '${pupil.lastName}', '${pupil.gender}', '${pupil.dob.toISOString()}', '${pupil.upn}', 0, 0);`
      pupils.push(sql)
    }
  }
  return pupils
}

function randomMiddleName (i) {
  const mnArray = ['Blue', 'Green', 'Red', 'Yellow', 'Purple', 'Black', 'White']
  // Assume 50% of people have middlenames
  const rnd = Math.floor(Math.random() * (mnArray.length * 2) + 1)
  return mnArray[rnd] ? mnArray[rnd] : ''
}

function randomDob () {
  const rnd = Math.floor(Math.random() * (365 * 2) + 1)
  const dob = moment().utc().subtract(9, 'years').subtract(rnd, 'days')
  dob.hours(0).minute(0).second(0)
  return dob.toDate()
}

module.exports.generateSql = function () {
  const statements = generatePupils()
  return statements.join('\n')
}
