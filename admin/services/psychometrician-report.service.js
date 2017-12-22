'use strict'
const csv = require('fast-csv')
const R = require('ramda')

const psReportCacheDataService = require('./data-access/ps-report-cache.data.service')
const completedCheckDataService = require('./data-access/completed-check.data.service')
const checkDataService = require('./data-access/check.data.service')
const dateService = require('./date.service')
const psUtilService = require('./psychometrician-util.service')
// const winston = require('winston')

const psychometricianReportService = {}

/**
 * Return the CSV file as a string
 * @return {Promise<void>}
 */
psychometricianReportService.generateReport = async function () {
  // Read data from the cache
  const data = await psReportCacheDataService.find({})
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

/**
 * Return a minimal report as a string
 * @return {Promise<void>}
 */
psychometricianReportService.generateScoreReport = async function () {
  // Read data from the cache
  const data = await psReportCacheDataService.find({})
  const output = []
  for (const obj of data) {
    output.push(scoreFilter(obj.data))
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

  // Generate one line of the report
  const psData = this.produceReportData(completedCheck)

  // Save the data.  We need the psreportcache.check to be unique - so that each check has only one entry in `psereportcache`
  // so we re-use the check._id as the psreportcache._id.  If Cosmos ever supports secondary unique indexes
  // we can just use those instead.  This allows us to use replaceOne (as we already know the _id) and overwrite
  // an existing record if it exists.

  await psReportCacheDataService.save({
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
  const checks = await checkDataService.sqlFindFullyPopulated({checkCode: {'$in': checkCodes}})
  // winston.info('checks > pupil > school', checks[0].pupilId.school)
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
    'TimeComplete': dateService.formatTimeWithSeconds(
      psUtilService.getClientTimestampFromAuditEvent('CheckComplete', completedCheck)
    ),
    // TimeTaken should TimeComplete - TimeStart - but we don't know TimeStart yet
    'TimeTaken': 'n/a'
  }

  // Add information for each question asked
  const p = (idx) => 'Q' + (idx + 1).toString()
  completedCheck.data.answers.forEach((ans, idx) => {
    const qInputs = R.pathOr([], ['data', 'inputs', idx], completedCheck)
    psData[p(idx) + 'ID'] = ans.factor1 + ' x ' + ans.factor2
    psData[p(idx) + 'Response'] = ans.answer
    psData[p(idx) + 'K'] = psUtilService.getUserInput(qInputs)
    psData[p(idx) + 'Sco'] = ans.isCorrect ? 1 : 0
    psData[p(idx) + 'ResponseTime'] = psUtilService.getResponseTime(qInputs)
    psData[p(idx) + 'TimeOut'] = psUtilService.getTimeoutFlag(qInputs)
    psData[p(idx) + 'TimeOut0'] = psUtilService.getTimeoutWithNoResponseFlag(qInputs, ans)
    psData[p(idx) + 'TimeOut1'] = psUtilService.getTimeoutWithCorrectAnswer(qInputs, ans)
    psData[p(idx) + 'tLoad'] = '' // data structure should be made more analysis friendly
    psData[p(idx) + 'tFirstKey'] = psUtilService.getFirstInputTime(qInputs)
    psData[p(idx) + 'tLastKey'] = psUtilService.getLastAnswerInputTime(qInputs)
    psData[p(idx) + 'OverallTime'] = '' // depends on tLoad
    psData[p(idx) + 'RecallTime'] = '' // depends on tLoad
    psData[p(idx) + 'TimeComplete'] = psUtilService.getLastAnswerInputTime(qInputs)
    psData[p(idx) + 'TimeTaken'] = '' // depends on tLoad
  })

  return psData
}

/**
 * Filter a psreportcache object to a minimal set of properties. Returns a new object.
 * @return {Object}
 */
function scoreFilter (obj) {
  const props = ['Surname', 'Forename', 'MiddleNames', 'FormMark', 'TestDate']
  const matchesScoreProp = (key) => /(ID|Response|Sco)+$/.test(key)
  const scoreProps = R.filter(matchesScoreProp, R.keys(obj))
  return R.pick(R.concat(props, scoreProps), obj)
}

module.exports = psychometricianReportService
