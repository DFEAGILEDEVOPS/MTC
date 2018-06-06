'use strict'
const winston = require('winston')
const csv = require('fast-csv')
const R = require('ramda')
const moment = require('moment')
const useragent = require('useragent')

const checkFormService = require('./check-form.service')
const checkFormDataService = require('./check-form.data.service')
const completedCheckDataService = require('./data-access/completed-check.data.service')
const dateService = require('./date.service')
const psUtilService = require('./psychometrician-util.service')

const anomalyReportService = {}
const anomalyReportService.reportedAnomalies = []

/**
 * Return the CSV file as a string
 * @return {Promise<void>}
 */
anomalyReportService.generateReport = async () => {
  const output = await anomalyReportService.findAllAnomalies()
  const headers = psychometricianReportService.produceReportDataHeaders(results)

  return new Promise((resolve, reject) => {
    csv.writeToString(
      output,
      {headers: headers},
      function (err, data) {
        if (err) { reject(err) }
        resolve(data)
      }
    )
  })
}

/**
 * Generate batched anomalies
 * @return {Array}
 */
anomalyReportService.findAllAnomalies = async () => {
  const checkInfo = await completedCheckDataService.sqlFindMeta()
  const batchSize = 250
  let lowCheckId = checkInfo.min // starting Check ID

  while (lowCheckId <= checkInfo.max) {
    // Fetching ${batchSize} checks for processing starting at ID ${lowCheckId}`
    const checks = await completedCheckDataService.sqlFind(lowCheckId, batchSize)
    const checkFormIds = checks.map(check => check.checkForm_id)
    const checkForms = await checkFormDataService.sqlFindByIds(checkFormIds)
    checks.forEach(check => {
      const checkForm = checkForms.find(checkForm => checkForm.id === check.checkForm_id)
      this.detectAnomalies(check, checkForm)
      lowCheckId = parseInt(check.id, 10) + 1
    })
  }

  return reportedAnomalies
}

/**
 * Push report data to the reported anomalies, from the populated check object
 * @param {Object} check
 * @param {String} message
 * @param {String} testedValue
 * @param {String} expectedValue
 * @param {String} questionNumber
 */
anomalyReportService.produceReportData = (check, message, testedValue = null, expectedValue = null, questionNumber = null) => {
  const agent = useragent.lookup(R.path(['data', 'device', 'navigator', 'userAgent'], check))
  const checkDate = getCheckDate(check)

  const reportData = [
    check.checkCode,
    checkDate,
    check.data.config.speechSynthesis,
    `${check.mark} out of ${check.maxMark}`,
    agent.device.toString().replace('0.0.0', ''),
    agent.toString(),
    message,
    testedValue,
    expectedValue,
    questionNumber
  ]

  this.reportedAnomalies.push(reportData)
}

/**
 * Returns the CSV headers
 * @param {Array} results
 * @returns {Array}
 */
anomalyReportService.produceReportDataHeaders = (results) => {
  const reportHeaders = [
    'Check Code',
    'Date',
    'Speech Synthesis',
    'Mark',
    'Device',
    'Agent',
    'Message',
    'Tested value',
    'Expected value',
    'Question number'
  ]

  return reportHeaders
}

anomalyReportService.detectAnomalies = (check, checkForm) => {
  this.detectWrongNumberOfAnswers(check)
  this.detectAnswersCorrespondToQuestions(check, checkForm)
  this.detectPageRefresh(check)
  this.detectInputBeforeOrAfterTheQuestionIsShown(check)
  this.detectMissingAudits(check)
  this.detectChecksThatTookLongerThanTheTheoreticalMax(check)
  this.detectInputThatDoesNotCorrespondToAnswers(check)
  this.detectQuestionsThatWereShownForTooLong(check)
  this.detectInputsWithoutQuestionInformation(check)
  this.detectApplicationErrors(check)

  // Navigator checks
  this.detectLowBattery(check)
  this.detectInsufficientVerticalHeight(check)
  this.detectLowColourDisplays(check)
}

anomalyReportService.detectWrongNumberOfAnswers = (check) => {
  const numberOfQuestions = check.data.questions.length
  const numberOfAnswers = check.data.answers.length
  if (numberOfAnswers !== numberOfQuestions) {
    this.produceReportData(check, 'Wrong number of answers', numberOfAnswers, numberOfQuestions)
  }
}

anomalyReportService.detectPageRefresh = (check) => {
  let pageRefreshCount = 0
  check.data.audit.forEach(entry => {
    if (entry.type === 'RefreshDetected') {
      pageRefreshCount += 1
    }
  })
  if (pageRefreshCount) {
    this.produceReportData(check, 'Page refresh detected', pageRefreshCount, 0)
  }
}

anomalyReportService.detectLowBattery = (check) => {
  const battery = R.path(['data', 'device', 'battery'], check)
  if (!battery) { return }
  if (battery.levelPercent < 20 && !battery.isCharging) {
    this.produceReportData(check, 'Low battery', '' + battery.levelPercent + '%' + ' charging ' + battery.isCharging, '> 20%')
  }
}

anomalyReportService.filterInputsForQuestion = (questionNumber, factor1, factor2, inputs) => {
  const filteredInputs = R.filter(
    i => i.sequenceNumber === questionNumber &&
      i.question === `${factor1}x${factor2}`,
    inputs)
  return filteredInputs
}

anomalyReportService.detectInputBeforeOrAfterTheQuestionIsShown = (check) => {
  // For each question we need to check that the inputs were not
  // received before the question was shown, or after the question
  // should have been closed.
  const questions = check.data.questions
  questions.forEach(question => {
    const questionRenderedEvent = check.data.audit.find(e => e.type === 'QuestionRendered' && e.data && e.data.sequenceNumber === question.order)
    if (!questionRenderedEvent) {
      return this.produceReportData(check, 'QuestionRenderedEvent not found', null, null, `Q${question.order}`)
    }
    const questionShownAt = moment(questionRenderedEvent.clientTimestamp)
    if (!questionShownAt.isValid()) {
      return this.produceReportData(check, 'QuestionRendered Timestamp is not valid', questionRenderedEvent.clientTimestamp, 'Valid ts')
    }
    // If there are any inputs before `questionShownAt` it's an anomaly
    const inputs = this.filterInputsForQuestion(question.order, question.factor1, question.factor2, R.pathOr([], ['data', 'inputs'], check))
    if (!inputs) {
      return
    }

    const questionTimeLimit = check.data.config.questionTime
    const questionCutoffAt = questionShownAt.clone()
    // Add a small tolerance to inputs received after the question time limit, to allow for slower hardware
    questionCutoffAt.add(questionTimeLimit * 1.05, 'seconds')

    // Check the inputs to make sure they all the right question property
    inputs.forEach(input => {
      const inputTimeStamp = moment(input.clientTimestamp)
      if (inputTimeStamp.isBefore(questionShownAt)) {
        this.produceReportData(check, 'Input received before Question shown', input.clientTimestamp, questionRenderedEvent.clientTimestamp, `Q${question.order}`)
      }
      // We shouldn't have any input after the QuestionRendered ts + the question time-limit
      if (inputTimeStamp.isAfter(questionCutoffAt)) {
        this.produceReportData(check, 'Input received after cut-off', input.clientTimestamp, dateService.formatIso8601(questionCutoffAt), `Q${question.order}`)
      }
    })
  })
}

anomalyReportService.detectMissingAudits = (check) => {
  // We expect to see a QuestionRendered and a PauseRendered event for each Question
  const numberOfQuestions = check.data.questions.length
  const questionRenderedAudits = check.data.audit.filter(audit => audit.type === 'QuestionRendered')
  const numberOfPractiseQuestions = 3
  if (questionRenderedAudits.length !== numberOfQuestions + numberOfPractiseQuestions) {
    this.produceReportData(check, 'Wrong number of QuestionRendered audits', questionRenderedAudits.length, numberOfQuestions + numberOfPractiseQuestions)
  }

  const pauseRenderedAudits = check.data.audit.filter(audit => audit.type === 'PauseRendered')
  if (pauseRenderedAudits.length !== numberOfQuestions + numberOfPractiseQuestions) {
    this.produceReportData(check, 'Wrong number of PauseRendered audits', pauseRenderedAudits.length, numberOfQuestions + numberOfPractiseQuestions)
  }

  const detectMissingSingleAudit = function (auditType) {
    // Detect events that should occur only once
    const audit = check.data.audit.find(audit => audit.type === auditType)
    if (!audit) {
      this.produceReportData(check, `Missing audit ${auditType}`)
    }
  }
  const singleMandatoryAuditEvents = [
    'WarmupStarted',
    'WarmupIntroRendered',
    'WarmupCompleteRendered',
    'CheckStarted',
    'CheckStartedApiCalled',
    'CheckSubmissionPending'
  ]

  singleMandatoryAuditEvents.map(arg => detectMissingSingleAudit(arg))
}

anomalyReportService.detectInputsWithoutQuestionInformation = (check) => {
  const inputs = check.data.inputs
  if (!inputs) { return }

  const eventsMissingInformation = inputs.filter(e => {
    if (!e) { return false }
    const sequenceNumber = parseInt(e.sequenceNumber)
    if (sequenceNumber === -1 || isNaN(sequenceNumber)) {
      return true
    }
    return false
  })
  if (eventsMissingInformation.length) {
    this.produceReportData(check, 'One or more Input events missing question information', eventsMissingInformation.length, 0)
  }
}

anomalyReportService.detectInsufficientVerticalHeight = (check) => {
  const height = R.path(['data', 'device', 'screen', 'innerHeight'], check)
  const width = R.path(['data', 'device', 'screen', 'innerWidth'], check) || R.path(['data', 'device', 'screen', 'innerWith'], check)

  // The vertical height required depends on the width, as we have 3 breakpoints
  if (width <= 640 && height < 558) {
    this.produceReportData(check, 'Insufficient browser vertical height', height, '> 558 pixels')
  } else if (width > 640 && width < 769 && height < 700) {
    this.produceReportData(check, 'Insufficient browser vertical height', height, '> 700 pixels')
  } else if (width > 769 && height < 660) {
    this.produceReportData(check, 'Insufficient browser vertical height', height, '> 660 pixels')
  }
}

anomalyReportService.detectLowColourDisplays = (check) => {
  const colourDepth = R.path(['data', 'device', 'screen', 'colorDepth'], check)
  if (colourDepth < 24) {
    this.produceReportData(check, 'Low colour display', colourDepth, '24')
  }
}

anomalyReportService.detectChecksThatTookLongerThanTheTheoreticalMax = (check) => {
  const numberOfQuestions = check.data.questions.length
  const config = check.data.config

  // Calculate the max total time allowed for the check
  const maxCheckSeconds = (numberOfQuestions * config.loadingTime) +
    (numberOfQuestions * config.questionTime) +
    (config.speechSynthesis ? numberOfQuestions * 2.5 : 0)

  // Calculate the time the check actually took
  const checkStart = psUtilService.getClientTimestampFromAuditEvent('CheckStarted', check)
  const checkComplete = psUtilService.getClientTimestampFromAuditEvent('CheckSubmissionPending', check)
  if (!checkStart || !checkComplete) {
    return this.produceReportData(check, 'Missing audit event ' + (checkStart ? 'CheckStarted' : 'CheckSubmissionPending'))
  }
  if (checkStart === 'error' || checkComplete === 'error') {
    return this.produceReportData(check, 'Timestamp error ' + (checkStart === 'error' ? 'CheckStarted' : 'CheckSubmissionPending'))
  }
  const checkStartDate = moment(checkStart)
  const checkCompleteDate = moment(checkComplete)
  if (!checkStartDate.isValid()) {
    return this.produceReportData(check, 'Invalid CheckStarted date', checkStart)
  }
  if (!checkCompleteDate.isValid()) {
    return this.produceReportData(check, 'Invalid CheckSubmissionPending date', checkComplete)
  }
  const totalCheckSeconds = checkCompleteDate.diff(checkStartDate, 'seconds')
  if (totalCheckSeconds > maxCheckSeconds) {
    this.produceReportData(check, 'Check took too long', totalCheckSeconds, maxCheckSeconds)
  }
}

anomalyReportService.detectInputThatDoesNotCorrespondToAnswers = (check) => {
  check.data.answers.forEach((answer, idx) => {
    const questionNumber = idx + 1
    const inputs = this.filterInputsForQuestion(questionNumber, answer.factor1, answer.factor2, check.data.inputs)
    const answerFromInputs = this.reconstructAnswerFromInputs(inputs)
    // The answer only stores the first 5 inputs, so there is no point in comparing more
    // characters (the inputs stores all the characters entered)
    if (answer.answer.substring(0, 5) !== answerFromInputs.substring(0, 5)) {
      this.produceReportData(check, 'Answer from inputs captured does not equal given answer', answerFromInputs, answer.answer, `Q${idx + 1}`)
    }
  })
}

anomalyReportService.detectAnswersCorrespondToQuestions = (check, checkForm) => {
  const answerFactors = check.data.answers.map(answer => ({ f1: answer.factor1, f2: answer.factor2 }))
  const formData = JSON.parse(checkForm.formData)
  const difference = R.difference(answerFactors, formData)
  if (difference.length > 0) {
    this.produceReportData(check, 'Answers factors do not correspond to the questions factors', difference.length, 0)
  }
}

anomalyReportService.reconstructAnswerFromInputs = (events) => {
  let ans = ''
  if (!Array.isArray(events)) {
    return ans
  }
  events.forEach(event => {
    if (event.eventType !== 'click' && event.eventType !== 'keydown') {
      return
    }
    const upper = event.input.toUpperCase()
    if (upper === 'ENTER') {
      return
    }
    if (upper === 'BACKSPACE' || upper === 'DELETE' || upper === 'DEL') {
      if (ans.length > 0) {
        ans = ans.substr(0, ans.length - 1)
      }
    } else if (event.input.match(/^[0-9]$/)) {
      ans += event.input
    }
  })
  return ans
}

anomalyReportService.getCheckDate = (check) => {
  const checkStart = psUtilService.getClientTimestampFromAuditEvent('CheckStarted', check)
  let checkDate = ''

  if (checkStart && checkStart !== 'error') {
    const checkStartDate = moment(checkStart)
    checkDate = checkStartDate.isValid() ? dateService.formatUKDate(checkStartDate) : ''
  }
  return checkDate
}

anomalyReportService.addRelativeTimings = (elems) => {
  let lastTime, current
  for (let elem of elems) {
    if (!elem) {
      continue
    }

    if (!elem.clientTimestamp) {
      continue
    }

    current = moment(elem.clientTimestamp)
    if (lastTime) {
      const secondsDiff = (
        current.valueOf() - lastTime.valueOf()
      ) / 1000
      elem.relativeTiming = secondsDiff
    } else {
      elem.relativeTiming = 0
    }
    lastTime = current
  }
}

anomalyReportService.detectQuestionsThatWereShownForTooLong = (check) => {
  const audits = filterAllRealQuestionsAndPauseAudits(check)
  const config = check.data.config
  const head = R.head(audits)
  const tail = R.tail(audits)
  if (head.type !== 'PauseRendered') {
    throw new Error('First audit is NOT a pause')
  }
  // Add relative timings to each of the elements
  addRelativeTimings(audits)
  // Expected question time: allow a 5% tolerance for computer processing, and 2.5s for the speech to be read out (if configured)
  // NB: ticket 20864 will replace the 2.5 seconds with something accurate
  const expectedValue = (config.questionTime * 1.05) + (config.speechSynthesis ? 2.5 : 0)

  // To pick up the question number we have to look at the QuestionRendered event and no the following
  // pause event.
  let questionNumber

  for (let audit of tail) {
    if (audit.type === 'QuestionRendered') {
      questionNumber = R.path(['data', 'sequenceNumber'], audit)
    }
    // We detect the relative timing of the pause, as the relative timing of this shows the time the question was shown
    if (audit.type === 'PauseRendered' && audit.relativeTiming > expectedValue) {
      this.produceReportData(check, 'Question may have been shown for too long', audit.relativeTiming, expectedValue, questionNumber)
    }
  }
}

anomalyReportService.detectApplicationErrors = (check) => {
  const audits = check.data.audit
  const appErrors = audits.filter(c => c.type === 'AppError')
  if (appErrors.length) {
    this.produceReportData(check, 'Check has Application Errors', appErrors.length, 0)
  }
}

anomalyReportService.filterAllRealQuestionsAndPauseAudits = (check) => {
  let hasCheckStarted = false
  const output = []
  for (let audit of check.data.audit) {
    if (audit.type === 'CheckStarted') {
      hasCheckStarted = true
    }
    if (!hasCheckStarted) {
      // Don't filter practise questions
      continue
    }
    if (audit.type !== 'QuestionRendered' && audit.type !== 'PauseRendered') {
      continue
    }
    output.push(audit)
  }
  return output
}

module.exports = anomalyReportService
