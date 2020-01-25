#!/usr/bin/env node
'use strict'

const winston = require('winston')
const consoleTransport = new winston.transports.Console()
winston.add(consoleTransport)
const upnService = require('../../admin/services/upn.service')
winston.level = 'info'
const moment = require('moment')
const sqlService = require('../../admin/services/data-access/sql.service')
const pupilCountPerSchool = 40
const uuid = require('uuid/v4')

async function main () {
  try {
    await sqlService.initPool()
    const schools = await sqlService.query(`SELECT
      id,
      dfeNumber,
      estabCode,
      leaCode
    from [mtc_admin].[school]`)

    console.log(`Generating ${pupilCountPerSchool} pupils each for ${schools.length} schools`)
    let c = 1
    for (const school of schools) {
      await insertPupils(school, 40)
      c += 1
      if (c % 1000 === 0) {
        console.log(`${c} schools`)
      }
    }
  } catch (error) {
    console.log(error.message)
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
  for (let i = 0; i < count; i++) {
    pupilData.push([
      `( '${randomDob()}'`,
      `'Pupil'`,
      `'M'`,
      `'${count.toString()}'`,
      school.id,
      `'${genFakeUpn()}')`
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

function genFakeUpn () {
  var id = uuid()
  return id.replace('-', '').substr(0, 13)
}

function genUPN (leaCode, estabCode, serial) {
  try {
    const upn = '' + leaCode.toString() + estabCode + (new Date().getFullYear().toString().substr(-2)) +
      serial.toString().padStart(3, '0')
    const checkLetter = upnService.calculateCheckLetter(upn)
    return checkLetter + upn
  } catch (error) {
    console.log(`Failed on: leaCode [${leaCode}] estab: [${estabCode}] serial: [${serial}]`)
  }
}
