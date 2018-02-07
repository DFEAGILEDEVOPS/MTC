'use strict'

const csv = require('fast-csv')
const fs = require('fs')
const path = require('path')
const winston = require('winston')
const moment = require('moment')
const config = require('../../../config')

const pupilPerSchoolCount = 60
let upnBase = 1

const sqlGenerator = () => {
  if (config.Environment !== 'Azure-Feb-Trial') return 'SELECT 42'

  const csvPath = path.join(__dirname, '../../files/feb-trial-schools.csv')
  const csvStream = fs.createReadStream(csvPath)
  const schoolInserts = ['DECLARE @schoolId int']
  return new Promise((resolve, reject) => {
    csv.fromStream(csvStream, { headers: true })
  .on('data', (data) => {
    const schoolInsert = createSchoolInsert(data)
    schoolInserts.push(schoolInsert)
    schoolInserts.push('SELECT @schoolId = SCOPE_IDENTITY()')
    schoolInserts.push(createSixtyPupilsInsertForSchool())
  })
  .on('end', () => {
    const inserts = schoolInserts.join('\n')
    resolve(inserts)
  })
  .on('error', (error) => {
    winston.error(`error processing ${csvPath} for school inserts...\n${error}`)
    reject(error)
  })
  })
}

function createSchoolInsert (data) {
  return `INSERT INTO [mtc_admin].[school] ([name], [urn], [dfeNumber], [estabCode] VALUES ('${makeStringSqlSafe(data.name)}', ${data.dfeNumber}, ${data.dfeNumber}, 'FEB-TRIAL')`
}

function createSixtyPupilsInsertForSchool () {
  const pupilInserts = []
  let foreName, gender, dateOfBirth, upn
  for (let pupilIndex = 0; pupilIndex < pupilPerSchoolCount; pupilIndex++) {
    const upnNumber = upnBase.toString().padStart(11, '0')
    upn = `A${upnNumber}A`
    upnBase++
    const pupilNumber = (pupilIndex + 1).toString().padStart(2, '0')
    foreName = `Pupil ${pupilNumber}`
    gender = ~~(Math.random() * 2) ? 'M' : 'F'
    dateOfBirth = moment('2000-01-01').add(pupilIndex, 'days').format('YYYY-MM-DD').toString()
    pupilInserts.push(`INSERT [mtc_admin].[pupil] (school_id, foreName, lastName, gender, dateOfBirth, upn) 
    VALUES (@schoolId, '${foreName}', 'Trial-' + CAST(@schoolId as NVARCHAR), '${gender}', '${dateOfBirth}', '${upn}')`)
  }
  return pupilInserts.join('\n')
}

function makeStringSqlSafe (str) {
  return str.replace('\'', '')
}

module.exports.generateSql = sqlGenerator
