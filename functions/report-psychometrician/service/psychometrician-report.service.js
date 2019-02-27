'use strict'
const R = require('ramda')
const moment = require('moment')

const dateService = require('./date.service')
const psUtilService = require('./psychometrician-util.service')
const psychometricianDataService = require('./data-service/psychometrician.data.service')
const psychometricianReportCacheDataService = require('./data-service/psychometrician-report-cache.data.service')

const psychometricianReportService = {}

/**
 *
 * @param batchIds - array of check IDs
 * @param context - function context
 * @return {Promise<void>}
 */
psychometricianReportService.batchProduceCacheData = async function (batchIds, context) {
  const checks = await psychometricianDataService.sqlFindCompletedChecksByIds(batchIds)

  if (!checks || !Array.isArray(checks) || !checks.length) {
    throw new Error('batchProduceCacheData(): Failed to find any checks')
  }

  // Fetch all pupils, checkForms, checkWindows or the checks
  const pupilIds = checks.map(x => x.pupil_id)
  const pupils = await psychometricianDataService.sqlFindPupilsByIds(pupilIds) // test-developer all-pupil access
  const checkForms = await psychometricianDataService.getCheckFormsByIds(checks.map(x => x.checkForm_id))
  const schools = await psychometricianDataService.sqlFindSchoolsByIds(pupils.map(x => x.school_id))

  // answers is an object with check.ids as keys and arrays of answers for that check as values
  const answers = await psychometricianDataService.sqlFindAnswersByCheckIds(checks.map(x => x.id))

  const psReportData = []

  for (let check of checks) {
    const pupil = pupils.find(x => x.id === check.pupil_id)
    const checkForm = checkForms.find(x => x.id === check.checkForm_id)
    const school = schools.find(x => x.id === pupil.school_id)
    // Fetch check ids based on pupil
    const pupilChecks = checks.filter(c => c.pupil_id === pupil.id)
    // Find check index from pupil's checks
    check.checkCount = pupilChecks.findIndex(c => check.id === c.id) + 1
    check.checkStatus = check.description
    // Generate one line of the report
    const data = psychometricianReportService.produceReportData(check, answers[check.id], pupil, checkForm, school)
    psReportData.push({ check_id: check.id, jsonData: data })
  }

  // save the reports into the DB
  try {
    await psychometricianReportCacheDataService.sqlInsertMany(psReportData)
  } catch (error) {
    context.log.error(`ERROR: psychometricianReportCacheDataService: failed to insert into db: ${error.message}`)
    throw error
  }
}

/**
 * Generate the ps report from the populated check object
 * CompletedCheck: check + the Check object fully populated with pupil (+ school), checkWindow
 * and checkForm
 * @param {Object} check
 * @param {Array} markedAnswers
 * @param {Object} pupil
 * @param {Object} checkForm
 * @param {Object} school
 * @return {Object}
 */
psychometricianReportService.produceReportData = function (check, markedAnswers, pupil, checkForm, school) {
  const userAgent = R.path(['data', 'device', 'navigator', 'userAgent'], check)
  const config = R.path(['data', 'config'], check)
  const deviceOptions = R.path(['data', 'device'], check)
  const { type, model } = psUtilService.getDeviceTypeAndModel(userAgent)
  const startTime = psUtilService.getClientTimestampFromAuditEvent('CheckStarted', check) || check.startedAt

  const psData = {
    'DOB': dateService.formatUKDate(pupil.dateOfBirth),
    'Gender': pupil.gender,
    'PupilId': pupil.upn,
    'Forename': pupil.foreName,
    'Surname': pupil.lastName,

    'FormMark': psUtilService.getMark(check),
    'QDisplayTime': R.pathOr('', ['questionTime'], config),
    'PauseLength': R.pathOr('', ['loadingTime'], config),
    'AccessArr': psUtilService.getAccessArrangements(config),
    'RestartReason': psUtilService.getRestartReasonNumber(check.restartCode),
    'RestartNumber': check.restartCount,
    'ReasonNotTakingCheck': psUtilService.getAttendanceReasonNumber(check.attendanceCode),
    'PupilStatus': psUtilService.getPupilStatus(check),

    'DeviceType': type,
    'DeviceTypeModel': model,
    'DeviceId': psUtilService.getDeviceId(deviceOptions),
    'BrowserType': psUtilService.getBrowser(userAgent),

    'School Name': school.name,
    'Estab': school.estabCode,
    'School URN': school.urn || '',
    'LA Num': school.leaCode,

    'AttemptId': check.checkCode,
    'Form ID': checkForm.name,
    'TestDate': dateService.reverseFormatNoSeparator(check.pupilLoginDate),

    // TimeStart should be when the user clicked the Start button.
    'TimeStart': startTime ? dateService.formatTimeWithSeconds(moment(startTime)) : '',
    // TimeComplete should be when the user presses Enter or the question Times out on the last question.
    // We log this as CheckComplete in the audit log
    'TimeComplete': dateService.formatTimeWithSeconds(moment(psUtilService.getClientTimestampFromAuditEvent('CheckSubmissionPending', check))),
    // TimeTaken should TimeComplete - TimeStart - but we don't know TimeStart yet
    'TimeTaken': psUtilService.getClientTimestampDiffFromAuditEvents('CheckStarted', 'CheckSubmissionPending', check)
  }

  // Add information for each question asked
  const p = (idx) => 'Q' + (idx + 1).toString()
  if (check.data && Object.keys(check.data).length > 0) {
    checkForm.formData.forEach((question, idx) => {
      // TODO: allocate questionNumber or QuestionId in the SPA answer data packet
      const markedAnswer = markedAnswers.find(a => a.factor1 === question.f1 && a.factor2 === question.f2)
      const inputs = R.filter(
        i => i.sequenceNumber === (idx + 1) &&
        i.question === `${question.f1}x${question.f2}`,
        R.pathOr([], ['data', 'inputs'], check))
      const audits = R.pathOr([], ['data', 'audit'], check)
      const ans = check.data.answers.find(x => x.sequenceNumber === (idx + 1) && question.f1 === x.factor1 && question.f2 === x.factor2)
      psData[p(idx) + 'ID'] = question.f1 + ' x ' + question.f2
      psData[p(idx) + 'Response'] = ans ? ans.answer : ''
      psData[p(idx) + 'InputMethods'] = psUtilService.getInputMethod(inputs)
      psData[p(idx) + 'K'] = psUtilService.getUserInput(inputs)
      psData[p(idx) + 'Sco'] = markedAnswer ? psUtilService.getScore(markedAnswer) : ''
      psData[p(idx) + 'ResponseTime'] = ans ? psUtilService.getResponseTime(inputs, ans.answer) : ''
      psData[p(idx) + 'TimeOut'] = psUtilService.getTimeoutFlag(ans.answer, inputs)
      psData[p(idx) + 'TimeOutResponse'] = ans ? psUtilService.getTimeoutWithNoResponseFlag(inputs, ans) : ''
      psData[p(idx) + 'TimeOutSco'] = markedAnswer ? psUtilService.getTimeoutWithCorrectAnswer(inputs, markedAnswer) : ''
      const tLoad = psUtilService.getLoadTime(idx + 1, audits)
      psData[p(idx) + 'tLoad'] = tLoad
      const tFirstKey = ans ? psUtilService.getFirstInputTime(inputs, ans.answer) : ''
      psData[p(idx) + 'tFirstKey'] = tFirstKey
      const tLastKey = ans ? psUtilService.getLastAnswerInputTime(inputs, ans.answer) : ''
      psData[p(idx) + 'tLastKey'] = tLastKey
      psData[p(idx) + 'OverallTime'] = psUtilService.getOverallTime(tLastKey, tLoad) // seconds
      psData[p(idx) + 'RecallTime'] = psUtilService.getRecallTime(tLoad, tFirstKey)
      psData[p(idx) + 'ReaderStart'] = psUtilService.getReaderStartTime(idx + 1, audits)
      psData[p(idx) + 'ReaderEnd'] = psUtilService.getReaderEndTime(idx + 1, audits)
    })
  }
  return psData
}

module.exports = psychometricianReportService
