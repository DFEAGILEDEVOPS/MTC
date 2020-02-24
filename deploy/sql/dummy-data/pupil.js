'use strict'

const sql = require('mssql')
const config = require('../config')
const uuid = require('uuid/v4')
const { performance } = require('perf_hooks')
const moment = require('moment')
const upnService = require('../../../admin/services/upn.service')

const pupilCountPerSchool = 300
let schoolCount = config.DummyData.SchoolCount
let schoolId = 7

const currentUTCDate = moment.utc()
const currentYear = currentUTCDate.year()
const academicYear = currentUTCDate.isBetween(moment.utc(`${currentYear}-01-01`), moment.utc(`${currentYear}-08-31`), null, '[]')
  ? currentYear - 1 : currentYear

function generateUpn (dfeNumber, currentPupilIndex) {
  const leaCode = dfeNumber.slice(0, 3)
  const estabCode = dfeNumber.slice(3, dfeNumber.length)
  const minYearValue = academicYear - 11
  const maxYearValue = academicYear - 7
  const year = Math.floor(Math.random() * (maxYearValue - minYearValue + 1) + minYearValue).toString().substr(-2)
  let baseUpn = leaCode + estabCode + year

  if (currentPupilIndex > 999) {
    currentPupilIndex = 1
    baseUpn = (parseInt(baseUpn) + 1000).toString()
  }
  const serial = currentPupilIndex.toString().padStart(3, '0')
  return upnService.calculateCheckLetter(baseUpn + serial) + baseUpn + serial
}

let estabBase = 1000
const leaCode = 777

function calculateAssumedDfeNumber (schoolIndex) {
  return `${leaCode}${estabBase + schoolIndex}`
}

const table = new sql.Table('mtc_admin.pupil')
table.create = false
table.columns.add('school_id', sql.Int, { nullable: false })
table.columns.add('foreName', sql.NVarChar, { length: 128 })
table.columns.add('lastName', sql.NVarChar, { length: 128 })
table.columns.add('gender', sql.Char, { length: 1, nullable: false })
table.columns.add('dateOfBirth', sql.DateTimeOffset(3), { nullable: false })
table.columns.add('upn', sql.Char(13), { nullable: false })

for (let schoolIdx = 0; schoolIdx < schoolCount; schoolIdx++) {
  const dfeNumber = calculateAssumedDfeNumber()
  for (let pupilIndex = 0; pupilIndex < pupilCountPerSchool; pupilIndex++) {
    table.rows.add(schoolId, `bulk pupil ${pupilIndex + 1}`, `pupil ${pupilIndex + 1}`,
      'F', new Date('2009-01-01'), generateUpn(dfeNumber, pupilIndex))
  }
  schoolId++
}

const pool = new sql.ConnectionPool(config.Sql)
pool.connect()
  .then(() => {
    console.log('connected')
    console.log(`inserting ${pupilCountPerSchool} pupils into ${schoolCount} schools...`)
    const request = new sql.Request(pool)
    const start = performance.now()
    request.bulk(table, async (err, result) => {
      const end = performance.now()
      const durationInMilliseconds = end - start
      const timeStamp = new Date().toISOString()
      if (err) {
        console.error(err.message)
        await pool.close()
        process.exit(-1)
      }
      console.log(`bulk pupil insert: ${timeStamp} completed in ${durationInMilliseconds} ms`)
      await pool.close()
    })
  })

function genFakeUpn () {
  return uuid().replace(/-/g, '').substr(0, 13)
}
