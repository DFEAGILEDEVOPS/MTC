#!/usr/bin/env node
'use strict'

require('dotenv').config()
const winston = require('winston')
const csv = require('fast-csv')
const chalk = require('chalk')
const fs = require('fs')
winston.level = 'info'
const moment = require('moment')
const useragent = require('useragent')

const dateService = require('../services/date.service')
const poolService = require('../services/data-access/sql.pool.service')
const completedCheckDataService = require('../services/data-access/completed-check.data.service')
const psUtilService = require('../services/psychometrician-util.service')

const outputFilename = 'anomalies.csv'
let anomalyCount = 0
let reportedAnomalies = []

function detectAnomalies (check) {
  detectWrongNumberOfAnswers(check)
  detectPageRefresh(check)
  detectWrongNumberOfInputs(check)
  detectInputBeforeOrAfterTheQuestionIsShown(check)
  detectMissingAudits(check)
  detectChecksThatTookLongerThanTheTheoreticalMax(check)
  detectInputThatDoesNotCorrespondToAnswers(check)

  // Navigator checks
  detectLowBattery(check)
  detectInsufficientVerticalHeight(check)
  detectLowColourDisplays(check)
}

function detectWrongNumberOfAnswers (check) {
  const numberOfQuestions = check.data.questions.length
  const numberOfAnswers = check.data.answers.length
  if (numberOfAnswers !== numberOfQuestions) {
    report(check.checkCode, 'Wrong number of answers', check.data.device.navigator.userAgent, numberOfAnswers, numberOfQuestions)
  }
}

function detectWrongNumberOfInputs (check) {
  const numberOfQuestions = check.data.questions.length
  const numberOfInputs = check.data.inputs.length
  if (numberOfInputs !== numberOfQuestions) {
    report(check.checkCode, 'Wrong number of inputs', check.data.device.navigator.userAgent, numberOfInputs, numberOfQuestions)
  }
}

function detectPageRefresh (check) {
  let pageRefreshCount = 0
  check.data.audit.forEach(entry => {
    if (entry.type === 'RefreshDetected') {
      pageRefreshCount += 1
    }
  })
  if (pageRefreshCount) {
    report(check.checkCode, 'Page refresh detected', pageRefreshCount, 0)
  }
}

function detectLowBattery (check) {
  const battery = check.data.device.battery
  if (!battery) { return }
  if (battery.levelPercent < 20 && !battery.isCharging) {
    report(check.checkCode, 'Low battery', check.data.device.navigator.userAgent, '' + battery.levelPercent + '%' + ' charging ' + battery.isCharging, '> 20%')
  }
}

function detectInputBeforeOrAfterTheQuestionIsShown (check) {
  // For each question we need to check that the inputs were not
  // received before the question was shown, or after the question
  // should have been closed.
  const questions = check.data.questions
  questions.forEach(question => {
    const questionRenderedEvent = check.data.audit.find(e => e.type === 'QuestionRendered' && e.data && e.data.sequenceNumber === question.order)
    if (!questionRenderedEvent) {
      return report(check.checkCode, 'QuestionRenderedEvent not found', check.data.device.navigator.userAgent, null, null, `Q${question.order}`)
    }
    const questionShownAt = moment(questionRenderedEvent.clientTimestamp)
    if (!questionShownAt.isValid()) {
      return report(check.checkCode, 'QuestionRendered Timestamp is not valid', check.data.device.navigator.userAgent, questionRenderedEvent.clientTimestamp, 'Valid ts')
    }
    // If there are any inputs before `questionShownAt` it's an anomaly
    const inputs = check.data.inputs[question.order - 1]
    if (!inputs) {
      return
    }

    const questionTimeLimit = check.data.config.questionTime
    const questionCutoffAt = questionShownAt.clone()
    // Add a small tolerance to inputs received after the question time limit, to allow for slower hardware
    questionCutoffAt.add(questionTimeLimit * 1.05, 'seconds')

    // Check the inputs to make sure they all the right question property
    inputs.forEach(input => {
      if (input.question !== question.order) {
        report(check.checkCode, 'Input fails property check', check.data.device.navigator.userAgent, input.question, question.order)
      }
      const inputTimeStamp = moment(input.clientInputDate)
      if (inputTimeStamp.isBefore(questionShownAt)) {
        report(check.checkCode, 'Input received before Question shown', check.data.device.navigator.userAgent, input.clientInputDate, questionRenderedEvent.clientTimestamp, `Q${question.order}`)
      }
      // We shouldn't have any input after the QuestionRendered ts + the question time-limit
      if (inputTimeStamp.isAfter(questionCutoffAt)) {
        report(check.checkCode, 'Input received after cut-off', check.data.device.navigator.userAgent, input.clientInputDate, dateService.formatIso8601(questionCutoffAt), `Q${question.order}`)
      }
    })
  })
}

function detectMissingAudits (check) {
  // We expect to see a QuestionRendered and a PauseRendered event for each Question
  const numberOfQuestions = check.data.questions.length
  const questionRenderedAudits = check.data.audit.filter(audit => audit.type === 'QuestionRendered')
  const numberOfPractiseQuestions = 3
  if (questionRenderedAudits.length !== numberOfQuestions + numberOfPractiseQuestions) {
    report(check.checkCode, 'Wrong number of QuestionRendered audits', check.data.device.navigator.userAgent, questionRenderedAudits.length, numberOfQuestions + numberOfPractiseQuestions)
  }

  const pauseRenderedAudits = check.data.audit.filter(audit => audit.type === 'PauseRendered')
  if (pauseRenderedAudits.length !== numberOfQuestions + numberOfPractiseQuestions) {
    report(check.checkCode, 'Wrong number of PauseRendered audits', check.data.device.navigator.userAgent, pauseRenderedAudits.length, numberOfQuestions + numberOfPractiseQuestions)
  }

  const detectMissingSingleAudit = function (auditType) {
    // Detect events should occur only once
    const audit = check.data.audit.find(audit => audit.type === auditType)
    if (!audit) {
      report(check.checkCode, `Missing audit ${auditType}`, check.data.device.navigator.userAgent)
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

function detectInsufficientVerticalHeight (check) {
  const height = check.data.device.screen.innerHeight
  const width = check.data.device.screen.innerWith || check.data.device.screen.innerWidth

  // The vertical height required depends on the width, as we have 3 breakpoints
  if (width <= 640 && height < 558) {
    report(check.checkCode, 'Insufficient browser vertical height', check.data.device.navigator.userAgent, height, '> 558 pixels')
  } else if (width > 640 && width < 769 && height < 700) {
    report(check.checkCode, 'Insufficient browser vertical height', check.data.device.navigator.userAgent, height, '> 700 pixels')
  } else if (width > 769 && height < 660) {
    report(check.checkCode, 'Insufficient browser vertical height', check.data.device.navigator.userAgent, height, '> 660 pixels')
  }
}

function detectLowColourDisplays (check) {
  const colourDepth = check.data.device.screen.colorDepth
  if (colourDepth < 24) {
    report(check.checkCode, 'Low colour display', check.data.device.navigator.userAgent, colourDepth, '24')
  }
}

function detectChecksThatTookLongerThanTheTheoreticalMax (check) {
  const numberOfQuestions = check.data.questions.length
  const config = check.data.config

  // Calculate the max total time allowed for the check
  const maxCheckSeconds = (numberOfQuestions * config.loadingTime) + (numberOfQuestions * config.questionTime)

  // Calculate the time the check actually took
  const checkStart = psUtilService.getClientTimestampFromAuditEvent('CheckStarted', check)
  const checkComplete = psUtilService.getClientTimestampFromAuditEvent('CheckSubmissionPending', check)
  if (!checkStart || !checkComplete) {
    return report(check.checkCode, 'Missing audit event ' + (checkStart ? 'CheckStarted' : 'CheckSubmissionPending'), check.data.device.navigator.userAgent)
  }
  if (checkStart === 'error' || checkComplete === 'error') {
    return report(check.checkCode, 'Timestamp error ' + (checkStart === 'error' ? 'CheckStarted' : 'CheckSubmissionPending'), check.data.device.navigator.userAgent)
  }
  const checkStartDate = moment(checkStart)
  const checkCompleteDate = moment(checkComplete)
  if (!checkStartDate.isValid()) {
    return report(check.checkCode, 'Invalid CheckStarted date', check.data.device.navigator.userAgent, checkStart)
  }
  if (!checkCompleteDate.isValid()) {
    return report(check.checkCode, 'Invalid CheckSubmissionPending date', check.data.device.navigator.userAgent, checkComplete)
  }
  const totalCheckSeconds = checkCompleteDate.diff(checkStartDate, 'seconds')
  if (totalCheckSeconds > maxCheckSeconds) {
    report(check.checkCode, 'Check took too long', check.data.device.navigator.userAgent, totalCheckSeconds, maxCheckSeconds)
  }
}

function detectInputThatDoesNotCorrespondToAnswers (check) {
  check.data.answers.forEach((answer, idx) => {
    const answerFromInputs = reconstructAnswerFromInputs(check.data.inputs[idx])
    if (answer.answer !== answerFromInputs) {
      report(check.checkCode, 'Answer from inputs captured does not equal given answer', check.data.device.navigator.userAgent, answerFromInputs, answer.answer, `Q${idx + 1}`)
    }
  })
}

function reconstructAnswerFromInputs (events) {
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

function report (checkCode, message, userAgent, testedValue = null, expectedValue = null, questionNumber = null) {
  anomalyCount += 1
  const agent = useragent.lookup(userAgent)
  reportedAnomalies.push([
    checkCode,
    agent.device.toString().replace('0.0.0', ''),
    agent.toString(),
    message,
    testedValue,
    expectedValue,
    questionNumber
  ])
}

function writeCsv (data) {
  if (!data.length) {
    return
  }
  const ws = fs.createWriteStream(outputFilename, { flags: 'a' })
  csv
    .write(data, {headers: false})
    .pipe(ws)
  ws.write('\n')
}

async function main () {
  const ws = fs.createWriteStream(outputFilename, { flags: 'w' })
  ws.write('Check Code,Device,Agent,Message,Tested value,Expected value,Question number\n')
  ws.end()
  const checkInfo = await completedCheckDataService.sqlFindMeta()
  winston.info(checkInfo)
  const batchSize = 250
  let lowCheckId = checkInfo.min // starting Check ID
  let count = 0

  while (lowCheckId < checkInfo.max) {
    winston.info(`Fetching ${batchSize} checks for processing starting at ID ${lowCheckId}`)
    const checks = await completedCheckDataService.sqlFind(lowCheckId, batchSize)
    checks.forEach(check => {
      detectAnomalies(check)
      count = count + 1
      lowCheckId = parseInt(check.id, 10) + 1
    })
    writeCsv(reportedAnomalies)
    reportedAnomalies = []
  }
  winston.info(`${count} checks processed`)
  console.log(chalk.cyan(`${anomalyCount} anomalies detected`))
  if (anomalyCount) {
    console.log(chalk.cyan(`Anomalies are written to ${outputFilename}`))
  }
}

main()
  .then(() => {
    poolService.drain()
  })
  .catch(e => {
    console.warn(e)
    poolService.drain()
  })
