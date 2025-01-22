#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}
const winston = require('winston')
const upnService = require('../services/upn.service')
winston.level = 'info'
const moment = require('moment')
const sqlService = require('../services/data-access/sql.service')
const pupilCountPerSchool = 30

const schoolIdParam = process.argv[2]
const schoolId = parseInt(schoolIdParam)

if (isNaN(schoolId)) {
  console.error('target school id (int) is a required argument')
  process.exitCode = -1
  process.exit()
}

async function main () {
  try {
    const school = await sqlService.query(`SELECT
      id,
      estabCode,
      leaCode,
      [name]
    from [mtc_admin].[school] WHERE id=${schoolId}`)
    await insertPupils(school[0], pupilCountPerSchool)
  } catch (error) {
    console.error(error.message)
    throw error
  }
}

main()
  .then(() => {
    sqlService.drainPool()
  })
  .catch(e => {
    console.warn(e)
    sqlService.drainPool()
  })

async function insertPupils (school, count) {
  const insert = `INSERT INTO [mtc_admin].[pupil] (
    dateOfBirth,
    foreName,
    gender,
    lastName,
    school_id,
    upn
  ) VALUES`
  const pupilData = []
  console.log(`Generating ${pupilCountPerSchool} pupils for ${school.name}`)
  for (let i = 0; i < count; i++) {
    pupilData.push([
      `( '${randomDob()}'`,
      '\'Pupil\'',
      '\'M\'',
      `'${count.toString()}'`,
      school.id,
      `'${genUPN(school.leaCode, school.estabCode, i)}')`
    ].join(' , '))
  }
  const sql = `${insert} ${pupilData.join(', \n')}`
  return sqlService.modify(sql)
}

function randomDob () {
  const rnd = Math.floor(Math.random() * (365 * 2) + 1)
  const dob = moment().utc().subtract(9, 'years').subtract(rnd, 'days')
  dob.hours(0).minute(0).second(0)
  return dob.toISOString()
}

function genUPN (leaCode, estabCode, serial) {
  try {
    const upn = '' + leaCode.toString() + estabCode + (new Date().getFullYear().toString().substr(-2)) +
      serial.toString().padStart(3, '0')
    const checkLetter = upnService.calculateCheckLetter(upn)
    return checkLetter + upn
  } catch {
    console.error(`Failed on: leaCode [${leaCode}] estab: [${estabCode}] serial: [${serial}]`)
  }
}
