'use strict'
const csv = require('fast-csv')
const R = require('ramda')
const moment = require('moment')
const momentDurationFormatSetup = require('moment-duration-format')
momentDurationFormatSetup(moment)

const completedCheckDataService = require('./data-access/completed-check.data.service')
const dateService = require('./date.service')
const psUtilService = require('./psychometrician-util.service')
const pupilDataService = require('./data-access/pupil.data.service')
const checkFormDataService = require('./data-access/check-form.data.service')
const checkWindowDataService = require('./data-access/check-window.data.service')
const schoolDataService = require('./data-access/school.data.service')
const psychometricianReportCacheDataService = require('./data-access/psychometrician-report-cache.data.service')

const psychometricianReportService = {}

/**
 * Return the CSV file as a string
 * @return {Promise<void>}
 */
psychometricianReportService.generateReport = async function () {
  // Read data from the cache
  const results = await psychometricianReportCacheDataService.sqlFindAll()
  const output = []
  for (const obj of results) {
    output.push(obj.jsonData)
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
  const results = await psychometricianReportCacheDataService.sqlFindAll()
  const output = []
  for (const obj of results) {
    output.push(scoreFilter(obj.jsonData))
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

  const completedChecks = await completedCheckDataService.sqlFindByIds(batchIds)

  // Fetch all pupils, checkForms, checkWindows or the checks
  const pupils = await pupilDataService.sqlFindByIds(completedChecks.map(x => x.pupil_id))
  const checkForms = await checkFormDataService.sqlFindByIds(completedChecks.map(x => x.checkForm_id))
  const schools = await schoolDataService.sqlFindByIds(pupils.map(x => x.school_id))
  // const checkWindows = await checkWindowDataService.sqlFindByIds(completedChecks.map(x => x.check))

  const psReportData = []

  for (let check of completedChecks) {
    const pupil = pupils.find(x => x.id === check.pupil_id)
    const checkForm = checkForms.find(x => x.id === check.checkForm_id)
    const school = schools.find(x => x.id === pupil.school_id)
    // Generate one line of the report
    const data = this.produceReportData(check, pupil, checkForm, school)
    psReportData.push({ check_id: check.id, jsonData: data })
  }

  // save psReportData
  await psychometricianReportCacheDataService.sqlInsertMany(psReportData)
}

/**
 * Add the Check collection information to the completedChecks by modifying the object directly
 * TODO: refactor the db to make completedChecks.check a 'ref' and remove this code
 * @param completedChecks
 * @return {Promise.<void>}
 */

/**
 * Generate the ps report from the populated check object
 * CompletedCheck: check + the Check object fully populated with pupil (+ school), checkWindow
 * and checkForm
 * @param check
 * @return {{Surname: string, Forename: string, MiddleNames: string, DOB: *, Gender, PupilId, FormMark: *, School Name, Estab, School URN: (School.urn|{type, trim, min}|*|any|string), LA Num: (number|School.leaCode|{type, required, trim, max, min}|leaCode|*), AttemptId, Form ID, TestDate: *, TimeStart: string, TimeComplete: *, TimeTaken: string}}
 */
psychometricianReportService.produceReportData = function (check, pupil, checkForm, school) {
  const psData = {
    'DOB': dateService.formatUKDate(pupil.dateOfBirth),
    'Gender': pupil.gender,
    'PupilId': pupil.upn,

    'FormMark': psUtilService.getMark(check),

    'School Name': school.name,
    'Estab': school.estabCode,
    'School URN': school.urn || '',
    'LA Num': school.leaCode,

    'AttemptId': check.checkCode,
    'Form ID': `${checkForm.name} (ID ${checkForm.id})`,
    'TestDate': dateService.reverseFormatNoSeparator(check.pupilLoginDate),

    // TimeStart should be when the user clicked the Start button.
    'TimeStart': dateService.formatTimeWithSeconds(
      moment(psUtilService.getClientTimestampFromAuditEvent('CheckStarted', check))
    ),
    // TimeComplete should be when the user presses Enter or the question Times out on the last question.
    // We log this as CheckComplete in the audit log
    'TimeComplete': dateService.formatTimeWithSeconds(
      moment(psUtilService.getClientTimestampFromAuditEvent('CheckSubmissionPending', check))
    ),
    // TimeTaken should TimeComplete - TimeStart - but we don't know TimeStart yet
    'TimeTaken':
      moment.duration(
        moment(psUtilService.getClientTimestampFromAuditEvent('CheckSubmissionPending', check))
        .diff(moment(psUtilService.getClientTimestampFromAuditEvent('CheckStarted', check)))
      ).format('HH:mm:ss', {trim: false})

  }

  // // Add information for each question asked
  // const p = (idx) => 'Q' + (idx + 1).toString()
  // check.data.answers.forEach((ans, idx) => {
  //   const qInputs = R.pathOr([], ['data', 'inputs', idx], check)
  //   psData[p(idx) + 'ID'] = ans.factor1 + ' x ' + ans.factor2
  //   psData[p(idx) + 'Response'] = ans.answer
  //   psData[p(idx) + 'K'] = psUtilService.getUserInput(qInputs)
  //   psData[p(idx) + 'Sco'] = ans.isCorrect ? 1 : 0
  //   psData[p(idx) + 'ResponseTime'] = psUtilService.getResponseTime(qInputs)
  //   psData[p(idx) + 'TimeOut'] = psUtilService.getTimeoutFlag(qInputs)
  //   psData[p(idx) + 'TimeOut0'] = psUtilService.getTimeoutWithNoResponseFlag(qInputs, ans)
  //   psData[p(idx) + 'TimeOut1'] = psUtilService.getTimeoutWithCorrectAnswer(qInputs, ans)
  //   psData[p(idx) + 'tLoad'] = '' // data structure should be made more analysis friendly
  //   psData[p(idx) + 'tFirstKey'] = psUtilService.getFirstInputTime(qInputs)
  //   psData[p(idx) + 'tLastKey'] = psUtilService.getLastAnswerInputTime(qInputs)
  //   psData[p(idx) + 'OverallTime'] = '' // depends on tLoad
  //   psData[p(idx) + 'RecallTime'] = '' // depends on tLoad
  //   psData[p(idx) + 'TimeComplete'] = psUtilService.getLastAnswerInputTime(qInputs)
  //   psData[p(idx) + 'TimeTaken'] = '' // depends on tLoad
  // })

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
