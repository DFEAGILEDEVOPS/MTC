#!/usr/bin/env node
'use strict'
/* Check for corrupt data in the PS report */

const fs = require('fs')
const csv = require('fast-csv')
const startTime = Date.now()
const R = require('ramda')
const RA = require('ramda-adjunct')

// const timeRegex =  /^\d{1,2}:\d{2}:\d{2} (AM|PM)$/i // e.g. '8:33:40 am' Not quite right - PM instead pm and single digit hours
const timeRegex = /^\d{2}:\d{2}:\d{2} (AM|PM)$/ // Correct '08:33:40 AM'

/** Utility functions */
function help () {
  console.log(`usage: ${process.argv[0]} <ps-file-to-inspect>`)
}

function report (prop, row, val) {
  // console.log()
  console.log(`${prop} field not matched for ${row['AttemptId']} val was '${val}'`)
}

function reportMissing (row, prop) {
  process.stderr.write(`${prop} field missing for ${row['AttemptId']}\n`)
}

function reportProgress () {
  // process.stdout.write('.')
}

/**
 * Test a property on a object according to the given RegExp
 * @param {Object} row
 * @param {String} prop
 * @param {RegExp} regex
 */
function regexTest (row, prop, regex) {
  if (row.hasOwnProperty(prop)) {
    const val = row[prop]
    if (val.length && !regex.test(val)) {
      report(prop, row, val)
    }
  } else {
    console.log(`Missing property: ${row['checkCode']} property: ${prop}`)
  }
}

function checkStringBetween(row, prop, lowLimit, highLimit) {
  const val = row[prop]
  if (!row.hasOwnProperty(prop)) {
    return reportMissing(row, prop)
  }
  console.log(`val is ${val} with length ${val.length}`)
  if (val.length < lowLimit || val.length > highLimit) {
    report(prop, row, val)
  }
}

function checkStringNotEmpty(row, prop) {
  const val = row[prop]
  if (!row.hasOwnProperty(prop)) {
    return reportMissing(row, prop)
  }
  if (val === '') {
    report(prop, row, row[prop])
  }
}

/** Field checks */
const checkID = function (row, prop) {
  const regex = /^\d{1,2} x \d{1,2}$/
  regexTest(row, prop, regex)
}

const checkResponse = function (row, prop) {
  const regex = /^\d{0,5}$/
  regexTest(row, prop, regex)
}

const checkK = function (row, prop) {
  const val = row[prop]
  const regex = /^([kmtx])?\[(.*)]*$/
  const inputs = val.split(', ')
  inputs.forEach(input => {
    const s = input.trim()
    if (s !== '' && !regex.test(s)) {
      report(prop, row, val)
    }
  })
}

const checkSco = function (row, prop) {
  const regex = /^([10])$/
  regexTest(row, prop, regex)
}

function checkResponseTime (row, prop) {
  const val = Number(row[prop])
  if (typeof val !== 'number') {
    report(prop, row, val)
  }
}

function checkTimeOut (row, prop) {
  const val = row[prop]
  if (val !== '' && val !== '1' && val !== '0') {
    report(prop, row, val)
  }
}

function checkTimeOutResponse (row, prop) {
  const val = row[prop]
  if (val !== '' && val !== '1' && val !== '0') {
    report(prop, row, val)
  }
}

function checkTimeOutSco (row, prop) {
  const val = row[prop]
  if (val !== '' && val !== '1' && val !== '0') {
    report(prop, row, val)
  }
}

function checktLoad (row, prop) {
  regexTest(row, prop, timeRegex)
}

function checktFirstKey (row, prop) {
  regexTest(row, prop, timeRegex)
}

function checktLastKey (row, prop) {
  regexTest(row, prop, timeRegex)
}

function checkOverallTime (row, prop) {
  const val = Number(row[prop])
  if (typeof val !== 'number') {
    report(prop, row, val)
  }
}

function checkRecallTime (row, prop) {
  const val = Number(row[prop])
  if (typeof val !== 'number') {
    report(prop, row, val)
  }
}

function checkReaderStart (row, prop) {
  regexTest(row, prop, timeRegex)
}

function checkReaderEnd (row, prop) {
  regexTest(row, prop, timeRegex)
}

function checkDob (row, prop) {
  const regex = /^\d\d\/\d\d\/\d\d\d\d$/
  if (!row[prop]) {
    return report(prop, row, row[prop])
  }
  regexTest(row, prop, regex)
}

function checkGender (row, prop) {
  const val = row[prop]
  if (val !== 'M' && val !== 'F') {
    report(prop, row, val)
  }
}

function checkPupilId (row, prop) {
  const val = row[prop]
  if (!row.hasOwnProperty(prop)) {
    return reportMissing(row, prop)
  }
  if (val.length !== 13) {
    report(prop, row, val)
  }
}



function checkForename (row, prop) {
  checkStringBetween(row, prop, 1, 128)
}

function checkSurname (row, prop) {
  checkStringBetween(row, prop, 1, 128)
}

function checkFormMark (row, prop) {
  const val = Number(row[prop])
  if (!row.hasOwnProperty(prop)) {
    return reportMissing(row, prop)
  }
  if (!(RA.isNumber(val)) && RA.inRange(0, 26, val)) {
    report(prop, row, row[prop])
  }
}

function checkQDisplayTime (row, prop) {
  const val = Number(row[prop])
  if (!row.hasOwnProperty(prop)) {
    return reportMissing(row, prop)
  }
  if (!RA.inRange(6, 9, val)) {
    report(prop, row, row[prop])
  }
}

function checkPauseLength (row, prop) {
  const val = Number(row[prop])
  if (!row.hasOwnProperty(prop)) {
    return reportMissing(row, prop)
  }
  if (val !== 3) {
    report(prop, row, row[prop])
  }
}

function checkDeviceType (row, prop) {
  checkStringNotEmpty()
}

function checkDeviceTypeModel (row, prop) {
  checkStringNotEmpty()
}



function checkDeviceID (row, prop) {
  // DeviceId
  checkStringNotEmpty()
}

function checkSchoolName (row, prop) {
  // School Name
  checkStringNotEmpty()
}

function checkEstab (row, prop) {
  const regex = /^\d{4}$/
  regexTest(row, prop, regex)
}

function checkSchoolURN (row, prop) {
  const regex = /^\d{6}$/
  regexTest(row, prop, regex)
}

function checkLAnum (row, prop) {
  // should be LAnum
  const regex = /^\d{3}$/
  regexTest(row, prop, regex)
}

function checkAttemptID (row, prop) {
  const regex = /^[0-9A-Za-z-]+$/
  regexTest(row, prop, regex)
}

function checkFormID (row, prop) {
  // should be FormID
  const regex = /^[0-9A-Za-z]{4,}$/
  regexTest(row, prop, regex)
}

function checkTestDate (row, prop) {
  const regex = /^\d{8}$/
  regexTest(row, prop, regex)
}

function checkTimeStart (row, prop) {
  regexTest(row, prop, timeRegex)
}

function checkTimeComplete (row, prop) {
  regexTest(row, prop, timeRegex)
}

function checkTimeTaken (row, prop) {
  // lots of negative time taken
  regexTest(row, prop, /^\d{2}:\d{2}:\d{2}$/)
}

function dataCheck (row, count) {
  if (count % 100 === 0) {
    reportProgress()
  }
  for (let i = 1; i < 26; i++) {
    const cols = [
      `Q${i}ID`,
      `Q${i}Response`,
      `Q${i}K`,
      `Q${i}Sco`,
      `Q${i}ResponseTime`,
      `Q${i}TimeOut`,
      `Q${i}TimeOutResponse`,
      `Q${i}TimeOutSco`,
      `Q${i}tLoad`,
      `Q${i}tFirstKey`,
      `Q${i}tLastKey`,
      `Q${i}OverallTime`,
      `Q${i}RecallTime`,
      `Q${i}ReaderStart`,
      `Q${i}ReaderEnd`
    ]
    const checks = [
      checkID,
      checkResponse,
      checkK,
      checkSco,
      checkResponseTime,
      checkTimeOut,
      checkTimeOutResponse,
      checkTimeOutSco,
      checktLoad,
      checktFirstKey,
      checktLastKey,
      checkOverallTime,
      checkRecallTime,
      checkReaderStart,
      checkReaderEnd
    ]
    const pairs = R.zip(cols, checks)
    pairs.forEach(entry => {
      if (typeof entry[1] === 'function') {
        entry[1](row, entry[0])
      }
    })
  }
  checkDob(row, 'DOB')
  checkGender(row, 'Gender')
  checkPupilId(row, 'PupilId')
  checkForename(row, 'Forename')
  checkSurname(row, 'Surname')
  checkFormMark(row, 'FormMark')
  checkQDisplayTime(row, 'QDisplayTime')
  checkPauseLength(row, 'PauseLength')
  checkDeviceType(row, 'DeviceType')
  checkDeviceTypeModel(row, 'DeviceTypeModel')
  checkDeviceID(row, 'DeviceId')
  checkSchoolName(row, 'School Name')
  checkEstab(row, 'Estab')
  checkSchoolURN(row, 'School URN')
  checkLAnum(row, 'LA Num')
  checkAttemptID(row, 'AttemptId')
  checkFormID(row, 'Form ID')
  checkTestDate(row, 'TestDate')
  checkTimeStart(row, 'TimeStart')
  checkTimeComplete(row, 'TimeComplete')
  checkTimeTaken(row, 'TimeTaken')
}

function finish (result) {
  const endTime = Date.now()
  const elapsedTime = endTime - startTime
  console.log('All done')
  console.log('Time taken: ', ((elapsedTime / 1000) / 60).toFixed(2), ' mins')
  console.log('Rows processed ', result)
}

function main () {
  const file = process.argv[2]
  if (!file) { return help() }
  console.log('Analysing ', file)
  let rowCount = 0
  fs.createReadStream(file)
    .pipe(csv.parse({ headers: true }))
    .on('data', (row) => dataCheck(row, ++rowCount))
    .on('end', finish)
}

main()
