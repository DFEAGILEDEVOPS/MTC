'use strict'
const moment = require('moment')
const csv = require('fast-csv')

const psCachedReportDataService = require('./data-access/ps-report-cache.data.service')
const completedCheckDataService = require('./data-access/completed-check.data.service')
const checkDataService = require('./data-access/check.data.service')
const dateService = require('./date.service')

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
    output.push(filter(obj.data))
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

  const psData = {
    'Surname': trim(completedCheck.check.pupilId.lastName, 35),
    'Forename': trim(completedCheck.check.pupilId.foreName, 35),
    'MiddleNames': trim(completedCheck.check.pupilId.middleNames, 35),
    'DOB': dateService.formatUKDate(completedCheck.check.pupilId.dob),
    'Gender': completedCheck.check.pupilId.gender,
    'PupilId': completedCheck.check.pupilId.upn,

    'FormMark': getMark(completedCheck),

    'School Name': completedCheck.check.pupilId.school.name,
    'Estab': completedCheck.check.pupilId.school.estabCode,
    'School URN': completedCheck.check.pupilId.school.urn || 'n/a',
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
    psData[p(idx) + 'TimeOut'] = hasTimeoutFlag(completedCheck.data.inputs[idx])
    psData[p(idx) + 'TimeOut0'] = hasTimeoutWithNoResponseFlag(completedCheck.data.inputs[idx], ans)
    // psData[p(idx) + 'TimeOut1'] =
    // psData[p(idx) + 'tLoad'] =
    // psData[p(idx) + 'tFirstKey'] =
    // psData[p(idx) + 'tLastKey'] =
    // psData[p(idx) + 'OverallTime'] =
    // psData[p(idx) + 'RecallTime'] =
    // psData[p(idx) + 'TimeStart'] =
    // psData[p(idx) + 'TimeComplete'] =
    // psData[p(idx) + 'TimeTaken'] =
  })

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

function getMark (completedCheck) {
  if (completedCheck.check && completedCheck.check.results && completedCheck.check.results.hasOwnProperty('marks')) {
    return completedCheck.check.results.marks
  }
  return 'n/a'
}

function getClientDateFromAuditEvent (auditEventType, completedCheck) {
  const logEntries = completedCheck.data.audit.filter(logEntry => logEntry.type === auditEventType)
  if (!logEntries.length) {
    return ''
  }
  const logEntry = logEntries[0]
  return logEntry.clientTimestamp
}

/**
 *
 * @param {string} string
 * @param {number} length
 * @return {string}
 */
function trim (string, length) {
  if (typeof string !== 'string') {
    return ''
  }
  return string.substring(0, length)
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
  if (!input) {
    return ''
  }
  if (!(Array.isArray(input) && input.length > 0)) {
    return ''
  }

  // In some older tests the first input may be null
  const firstLogEntry = input[0] ? input[0] : input[1]
  if (!firstLogEntry.clientInputDate) {
    console.log('First log Entry missing client input date: ', firstLogEntry)
  }
  const first = moment(firstLogEntry.clientInputDate)
  const lastLogEntry = input[input.length - 1]
  if (!lastLogEntry.clientInputDate) {
    console.log('First log Entry missing client input date: ', lastLogEntry)
  }
  const last = moment(lastLogEntry.clientInputDate)
  return moment(moment(last).diff(moment(first))).format('s.SSS')
}

/**
 * A flag to determine if the question timed out (rather than the user pressing Enter)
 * @param inputs
 * @return {number}
 */
function hasTimeoutFlag (inputs) {
  let timeout = 1
  if (inputs && inputs.length) {
    const last = inputs[inputs.length - 1]
    if (last.input && last.input.toUpperCase() === 'ENTER') {
      timeout = 0
    }
  }
  return timeout
}

function hasTimeoutWithNoResponseFlag (inputs, answer) {
  let timeout = 0
  if (answer.input === '' && inputs.length === 0) {
    timeout = 1
  }
  return timeout
}

/**
 * Copy an object and reverse the enumerable properties
 * @param obj
 */
function reverseObject (obj) {
  const newObj = {}
  Object.keys(obj).reverse().forEach(k => {
    newObj[k] = obj[k]
  })
  return newObj
}

function filter (obj) {
  // Filter the incoming object for Allen's report
  const newObj = {}
  const outputs = [
    'Surname',
    'Forename',
    'FormMark',
    'Form ID',
    'TestDate'
  ]
  for (let i = 1; i < 11; i++) {
    outputs.push(`Q${i}ID`)
    outputs.push(`Q${i}Response`)
    outputs.push(`Q${i}Sco`)
  }
  Object.keys(obj).forEach(k => {
    if (outputs.indexOf(k) !== -1) {
      newObj[k] = obj[k]
    }
  })
  return newObj
}

module.exports = psychometricianReportService
