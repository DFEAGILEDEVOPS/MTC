'use strict'
const moment = require('moment')
const csv = require('fast-csv')

const psCachedReportDataService = require('./data-access/ps-report-cache.data.service')
const completedCheckDataService = require('./data-access/completed-check.data.service')
const checkDataService = require('./data-access/check.data.service')
const dateService = require('./date.service')
const psUtilService = require('./psychometrician-util.service')

const psychometricianReportService = {}

/**
 * Return the CSV file as a string
 * @return {Promise<void>}
 */
psychometricianReportService.generateReport = async function () {
  // Read data from the cache
  const data = await psCachedReportDataService.find({})
  const output = []
  for (const obj of data) {
    output.push(obj.data)
  }

  return new Promise((resolve, reject) => {
    csv.writeToString(
      output,
      {headers: true},
      function (err, data) {
        if (err) { reject(err) }
        resolve(data)
      }
    )
  })
}

psychometricianReportService.batchProduceCacheData = async function (batchIds) {
  if (!batchIds) {
    throw new Error('Missing argument: batchIds')
  }

  if (!(Array.isArray(batchIds) && batchIds.length)) {
    throw new Error('Invalid arg: batchIds')
  }

  const completedChecks = await completedCheckDataService.find({_id: {'$in': batchIds}})

  // Address some deficiencies in the data model by adding in data required for the report
  // additional data is added as a side-effect to the completedChecks objects
  await this.populateWithCheck(completedChecks)

  for (let check of completedChecks) {
    await this.produceCacheData(check)
  }
}

psychometricianReportService.produceCacheData = async function (completedCheck) {
  if (!completedCheck) {
    throw new Error('Missing argument: completedCheck')
  }

  if (!(typeof completedCheck === 'object' && completedCheck._id)) {
    throw new Error('Invalid argument: completedCheck')
  }

  // Handle null's in older data sets.  This can be removed once
  // all of the older data is analysed.
  fixup(completedCheck)

  // Generate one line of the report
  const psData = this.produceReportData(completedCheck)

  // Save the data.  We need the psreportcache.check to be unique - so that each check has only one entry in `psereportcache`
  // so we re-use the check._id as the psreportcache._id.  If Cosmos ever supports secondary unique indexes
  // we can just use those instead.  This allows us to use replaceOne (as we already know the _id) and overwrite
  // an existing record if it exists.

  await psCachedReportDataService.save({
    _id: completedCheck.check._id,
    data: psData,
    check: completedCheck.check._id
  })
}

/**
 * Add the Check collection information to the completedChecks by modifying the object directly
 * TODO: refactor the db to make completedChecks.check a 'ref' and remove this code
 * @param completedChecks
 * @return {Promise.<void>}
 */
psychometricianReportService.populateWithCheck = async function (completedChecks) {
  const checkCodes = completedChecks.map(c => c.data.pupil.checkCode)
  const checks = await checkDataService.findFullyPopulated({checkCode: {'$in': checkCodes}})
  // console.log('checks > pupil > school', checks[0].pupilId.school)
  const checksByCheckCode = new Map()
  // populate the map
  checks.map(c => checksByCheckCode.set(c.checkCode, c))
  // splice it in
  for (const cc of completedChecks) {
    cc.check = checksByCheckCode.get(cc.data.pupil.checkCode)
  }
}

/**
 * Generate the ps report from the populated completedCheck object
 * CompletedCheck: completedCheck + the Check object fully populated with pupil (+ school), checkWindow
 * and checkForm
 * @param completedCheck
 * @return {{Surname: string, Forename: string, MiddleNames: string, DOB: *, Gender, PupilId, FormMark: *, School Name, Estab, School URN: (School.urn|{type, trim, min}|*|any|string), LA Num: (number|School.leaCode|{type, required, trim, max, min}|leaCode|*), AttemptId, Form ID, TestDate: *, TimeStart: string, TimeComplete: *, TimeTaken: string}}
 */
psychometricianReportService.produceReportData = function (completedCheck) {
  const psData = {
    'Surname': psUtilService.getSurname(completedCheck),
    'Forename': psUtilService.getForename(completedCheck),
    'MiddleNames': psUtilService.getMiddleNames(completedCheck),
    'DOB': dateService.formatUKDate(completedCheck.check.pupilId.dob),
    'Gender': completedCheck.check.pupilId.gender,
    'PupilId': completedCheck.check.pupilId.upn,

    'FormMark': psUtilService.getMark(completedCheck),

    'School Name': completedCheck.check.pupilId.school.name,
    'Estab': completedCheck.check.pupilId.school.estabCode,
    'School URN': psUtilService.getSchoolURN(completedCheck),
    'LA Num': completedCheck.check.pupilId.school.leaCode,

    'AttemptId': completedCheck.check.checkCode,
    'Form ID': completedCheck.check.checkFormId.name,
    'TestDate': dateService.reverseFormatNoSeparator(completedCheck.check.pupilLoginDate),

    // TimeStart should be when the user clicked the Start button.  This is not logged in the Audit log yet.
    'TimeStart': '',
    // TimeComplete should be when the user presses Enter or the question Times out on the last question.
    // We log this as CheckComplete in the audit log
    'TimeComplete': dateService.formatTimeWithSeconds(getClientDateFromAuditEvent('CheckComplete', completedCheck)),
    // TimeTaken should TimeComplete - TimeStart - but we don't know TimeStart yet
    'TimeTaken': 'n/a'
  }

  // Add information for each question asked
  const p = (idx) => 'Q' + (idx + 1).toString()
  completedCheck.data.answers.forEach((ans, idx) => {
    psData[p(idx) + 'ID'] = ans.factor1 + ' x ' + ans.factor2
    psData[p(idx) + 'Response'] = ans.answer
    psData[p(idx) + 'K'] = getUserInput(completedCheck.data.inputs[idx])
    psData[p(idx) + 'Sco'] = ans.isCorrect ? 1 : 0
    psData[p(idx) + 'ResponseTime'] = getResponseTime(completedCheck.data.inputs[idx])
    psData[p(idx) + 'TimeOut'] = getTimeoutFlag(completedCheck.data.inputs[idx])
    psData[p(idx) + 'TimeOut0'] = getTimeoutWithNoResponseFlag(completedCheck.data.inputs[idx], ans)
    psData[p(idx) + 'TimeOut1'] = getTimeoutWithCorrectAnswer(completedCheck.data.inputs[idx], ans)
    psData[p(idx) + 'tLoad'] = '' // data structure should be made more analysis friendly
    psData[p(idx) + 'tFirstKey'] = getTimeOfFirstUserInput(completedCheck.data.inputs[idx])
    psData[p(idx) + 'tLastKey'] = getTimeOfLastUserInput(completedCheck.data.inputs[idx])
    psData[p(idx) + 'OverallTime'] = '' // depends on tLoad
    psData[p(idx) + 'RecallTime'] = '' // depends on tLoad
    psData[p(idx) + 'TimeComplete'] = getLastAnswerInputTime(completedCheck.data.inputs[idx])
    psData[p(idx) + 'TimeTaken'] = '' // depends on tLoad
  })

  return psData
}

function getClientDateFromAuditEvent (auditEventType, completedCheck) {
  const logEntries = completedCheck.data.audit.filter(logEntry => logEntry.type === auditEventType)
  if (!logEntries.length) {
    return 'error'
  }
  const logEntry = logEntries[0]
  if (!logEntry.hasOwnProperty('clientTimestamp')) {
    return 'error'
  }
  return logEntry.clientTimestamp
}

/**
 * Return all key/mouse/touch inputs as a string for the report
 * @param {Object} answer
 * @return {string}
 */
function getUserInput (inputs) {
  const output = []
  if (!inputs) {
    return ''
  }
  if (!Array.isArray(inputs)) {
    return ''
  }
  inputs.forEach(inp => {
    let ident = ''

    switch (inp.eventType) {
      case 'keydown':
      case 'touch keydown':
        // hardware keyboard was pressed
        ident = 'k'
        break
      case 'click':
      case 'mousedown':
        // Mouse was pressed
        ident = 'm'
        break
      case 'touch click':
      case 'touch mousedown':
      case 'touchstart':
        // Mouse or fingers on a screen
        ident = 't'
        break
      default:
        console.log('Unknown input type: ' + inp.eventType)
        console.log('inp ', inp)
        ident = 'u'
        break
    }
    output.push(`${ident}[${inp.input}]`)
  })
  return output.join(', ')
}

function getResponseTime (input) {
  if (!(input && Array.isArray(input))) {
    console.log('Invalid input ', input)
    return 'error'
  }
  if (input.length === 0) {
    // no input was provided, so there isn't a 'time' component to show
    return ''
  }
  const firstLogEntry = input[0]
  if (!firstLogEntry.clientInputDate) {
    console.log('First log Entry missing client input date: ', firstLogEntry)
  }
  const first = moment(firstLogEntry.clientInputDate)
  const lastLogEntry = input[input.length - 1]
  if (!lastLogEntry.clientInputDate) {
    console.log('First log Entry missing client input date: ', lastLogEntry)
  }
  const last = moment(lastLogEntry.clientInputDate)
  return (last.format('x') - first.format('x')) / 1000
}

/**
 * A flag to determine if the question timed out (rather than the user pressing Enter)
 * @param inputs
 * @return {number}
 */
function hasTimeoutFlag (inputs) {
  let timeout = true
  if (!(inputs && Array.isArray(inputs))) {
    console.log('invalid input: ', inputs)
    throw new Error('Input not provided')
  }
  if (inputs.length) {
    const last = inputs[inputs.length - 1]
    if (last.input && last.input.toUpperCase() === 'ENTER') {
      timeout = false
    }
  }
  return timeout
}

/**
 * A report helper for the hasTimeoutFlag
 * @param inputs
 * @return {*}
 */
function getTimeoutFlag (inputs) {
  try {
    return toInt(hasTimeoutFlag(inputs))
  } catch (error) {
    console.error(error)
    return 'error'
  }
}

function hasTimeoutWithNoResponseFlag (inputs, answer) {
  let timeout = false
  if (!(inputs && Array.isArray(inputs))) {
    throw new Error('Invalid params inputs')
  }
  if (!(answer && answer.hasOwnProperty('answer'))) {
    console.log('invalid answer: ', answer)
    throw new Error('Invalid param answer')
  }
  if (answer.input === '' && inputs.length === 0) {
    timeout = true
  }
  return timeout
}

function getTimeoutWithNoResponseFlag (inputs, ans) {
  try {
    return toInt(hasTimeoutWithNoResponseFlag(inputs, ans))
  } catch (error) {
    console.error(error)
    return 'error'
  }
}

function hasTimeoutWithCorrectAnswer (inputs, ans) {
  if (!(hasTimeoutFlag(inputs) && hasCorrectAnswer(ans))) {
    return false
  }
  return true
}

function getTimeoutWithCorrectAnswer (inputs, ans) {
  try {
    return toInt(hasTimeoutWithCorrectAnswer(inputs, ans))
  } catch (error) {
    console.error(error)
    return 'error'
  }
}

function hasCorrectAnswer (ans) {
  if (!ans) {
    throw new Error('Answer not provided')
  }
  if (!ans.hasOwnProperty('isCorrect')) {
    throw new Error('Answer is not marked')
  }
  return ans.isCorrect
}

/**
 * A report helper to convert booleans to 1 or 0
 * @param bool
 * @return {number}
 */
function toInt (bool) {
  if (typeof bool !== 'boolean') {
    throw new Error(`param is not a boolean: [${bool}]`)
  }
  return bool ? 1 : 0
}

function fixup (completedCheck) {
  const inputs = completedCheck.data.inputs
  if (inputs[0] === null) {
    inputs.shift()
  }
}

function getTimeOfFirstUserInput (inputs) {
  if (!(inputs && Array.isArray(inputs))) {
    console.log('Invalid param inputs')
    return 'error'
  }
  if (inputs.length === 0) {
    return ''
  }
  const first = inputs[0]
  return getTimeOfInputEvent(first)
}

function getTimeOfLastUserInput (inputs) {
  if (!(inputs && Array.isArray(inputs))) {
    console.log('Invalid param inputs')
    return 'error'
  }
  if (inputs.length === 0) {
    return ''
  }
  const last = inputs[inputs.length - 1]
  return getTimeOfInputEvent(last)
}

function getTimeOfInputEvent (input) {
  if (!(input && input.hasOwnProperty('clientInputDate'))) {
    console.log('getTimeOfInputEvent(): Invalid param input: ', input)
    return 'error'
  }

  const time = moment(input.clientInputDate)
  if (!time.isValid()) {
    console.log('Date error: not a date ' + input.clientInputDate)
    return 'error'
  }
  return time.toISOString()
}

/**
 * Get the time of the user's last input that is not enter
 * @param {Array} inputs
 */
function getLastAnswerInputTime (inputs) {
  if (!(inputs && Array.isArray(inputs))) {
    console.log('Invalid param inputs')
    return 'error'
  }
  if (inputs.length === 0) {
    return ''
  }
  for (let i = inputs.length - 1; i >= 0; i--) {
    const inputEntry = inputs[i]
    if (!(inputEntry && inputEntry.hasOwnProperty('input') && inputEntry.clientInputDate)) {
      console.log('getLastAnswerInputTime invalid input: ', inputEntry)
      return 'error'
    }
    if (inputEntry.input.toUpperCase() !== 'ENTER') {
      const m1 = moment(inputEntry.clientInputDate)
      if (!m1.isValid()) {
        console.log('Date error: ' + inputEntry.clientInputDate)
        return 'error'
      }
      return m1.toISOString()
    }
  }
}
module.exports = psychometricianReportService
