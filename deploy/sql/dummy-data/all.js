'use strict'

const sql = require('mssql')
const config = require('../config')
const { performance } = require('perf_hooks')
const upnService = require('../../../admin/services/upn.service')
const moment = require('moment')
const axios = require('axios')

const schoolCount = config.DummyData.SchoolCount
const schoolOffset = config.DummyData.SchoolOffset
const schoolUpperLimit = schoolCount + schoolOffset
const pupilCountPerSchool = 300
const defaultFunctionBaseUrl = 'http://localhost:7071'

const password = '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK'
const teacherRoleId = 3

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

const pool = new sql.ConnectionPool(config.Sql)
pool.connect()
  .then(async () => {
    // schools
    console.log('connected')
    console.log(`inserting ${schoolCount} schools...`)
    const table = new sql.Table('mtc_admin.school')
    table.create = false
    table.columns.add('leaCode', sql.Int)
    table.columns.add('estabCode', sql.NVarChar, { length: 'max' })
    table.columns.add('name', sql.NVarChar, { length: 'max', nullable: false })
    table.columns.add('urn', sql.Int, { nullable: false })
    table.columns.add('dfeNumber', sql.Int, { nullable: false })

    let estabBase = 1000
    let urnBase = 10000
    let leaCode = 880

    const firstInsertedSchoolDfeNumber = `${leaCode}${estabBase}`
    for (let idx = schoolOffset; idx < schoolUpperLimit; idx++) {
      if (estabBase > 9999) {
        estabBase = 1000
        leaCode++
      }
      const dfeNumber = `${leaCode}${estabBase}`
      table.rows.add(leaCode, estabBase++, `bulk school ${(idx - schoolOffset) + 1}`, urnBase++, dfeNumber)
    }
    const schoolInsertRequest = new sql.Request(pool)
    const start = performance.now()
    try {
      await schoolInsertRequest.bulk(table)
    } catch (error) {
      console.error(error.message)
      await pool.close()
      process.exit(-1)
    }
    const end = performance.now()
    const durationInMilliseconds = end - start
    const timeStamp = new Date().toISOString()
    console.log(`bulk school insert: ${timeStamp} completed in ${durationInMilliseconds} ms`)
    console.log('triggering school pin generation...')
    const axiosConfig = {
      baseURL: defaultFunctionBaseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    await axios.post('/admin/functions/school-pin-generator', {}, axiosConfig)
    console.log('done')
    return firstInsertedSchoolDfeNumber
  })
  .then(async (firstInsertedSchoolDfeNumber) => {
    // establish first inserted school id from base dfe number
    console.log(`the first dfeNumber is ${firstInsertedSchoolDfeNumber}`)
    const request = new sql.Request(pool)
    let result
    try {
      result = await request.query(`SELECT id, dfeNumber FROM mtc_admin.school
        WHERE dfeNumber=${firstInsertedSchoolDfeNumber}`)
    } catch (error) {
      console.error(`error retrieving id of school with dfeNumber:${firstInsertedSchoolDfeNumber}
      \n error.message:${error.message}`)
      await pool.close()
      process.exit(-1)
    }
    return {
      school_id: result.recordset[0].id,
      dfeNumber: result.recordset[0].dfeNumber
    }
  })
  .then(async (schoolInfo) => {
    // pupils
    let schoolId = schoolInfo.school_id
    let dfeNumber = schoolInfo.dfeNumber
    const table = new sql.Table('mtc_admin.pupil')
    table.columns.add('school_id', sql.Int, { nullable: false })
    table.create = false
    table.columns.add('foreName', sql.NVarChar, { length: 128 })
    table.columns.add('lastName', sql.NVarChar, { length: 128 })
    table.columns.add('gender', sql.Char, { length: 1, nullable: false })
    table.columns.add('dateOfBirth', sql.DateTimeOffset(3), { nullable: false })
    table.columns.add('upn', sql.Char(13), { nullable: false })

    for (let schoolIdx = 0; schoolIdx < schoolCount; schoolIdx++) {
      for (let pupilIndex = 0; pupilIndex < pupilCountPerSchool; pupilIndex++) {
        table.rows.add(schoolId, `bulk pupil ${pupilIndex + 1}`, `pupil ${pupilIndex + 1}`,
          'F', new Date('2011-01-01'), generateUpn(dfeNumber.toString(), pupilIndex))
      }
      let leaCode = dfeNumber.toString().slice(0, 3)
      let estab = dfeNumber.toString().slice(4, 3)
      if (estab > 9999) {
        estab = 1000
        leaCode++
      }
      dfeNumber = `${leaCode}${estab}`
      schoolId++
    }
    console.log(`inserting ${pupilCountPerSchool} pupils into ${schoolCount} schools...`)
    const request = new sql.Request(pool)
    const start = performance.now()
    await request.bulk(table)
    const end = performance.now()
    const durationInMilliseconds = end - start
    const timeStamp = new Date().toISOString()
    console.log(`bulk pupil insert: ${timeStamp} completed in ${durationInMilliseconds} ms`)
    return schoolInfo
  })
  .then(async (schoolInfo) => {
    // teachers
    let schoolId = schoolInfo.school_id
    console.log(`do teachers with dfeNumber:${schoolInfo.dfeNumber} id:${schoolInfo.school_id}`)
    const table = new sql.Table('mtc_admin.user')
    table.create = false
    table.columns.add('identifier', sql.NVarChar(64), { nullable: false })
    table.columns.add('passwordHash', sql.NVarChar, { length: 'max' })
    table.columns.add('school_id', sql.Int)
    table.columns.add('role_id', sql.Int, { nullable: false })
    for (let teacherIndex = 0; teacherIndex < schoolCount; teacherIndex++) {
      table.rows.add(`bulk-teacher${teacherIndex + 1}`, password, schoolId++, teacherRoleId)
    }
    const request = new sql.Request(pool)
    const start = performance.now()
    await request.bulk(table)
    const end = performance.now()
    const durationInMilliseconds = end - start
    const timeStamp = new Date().toISOString()
    console.log(`bulk teacher insert: ${timeStamp} completed in ${durationInMilliseconds} ms`)
    await pool.close()
    console.log('all done.')
    process.exit(0)
  })
  .catch(async (error) => {
    console.error(`something went wrong: ${error.message}`)
    console.dir(error)
    await pool.close()
    process.exit(-1)
  })
