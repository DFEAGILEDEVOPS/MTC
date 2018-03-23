#!/usr/bin/env node
'use strict'

require('dotenv').config()
const winston = require('winston')
const csv = require('fast-csv')
const chalk = require('chalk')
const fs = require('fs')
winston.level = 'info'
const moment = require('moment')

const dateService = require('../services/date.service')
const poolService = require('../services/data-access/sql.pool.service')
const completedCheckDataService = require('../services/data-access/completed-check.data.service')

const outputFilename = 'anomalies.csv'
let anomalyCount = 0
let reportedAnomalies = []

function detectAnomalies (check) {
  detectWrongNumberOfAnswers(check)
  detectPageRefresh(check)
  detectWrongNumberOfInputs(check)
  detectInputBeforeOrAfterTheQuestionIsShown(check)
  detectMissingAudits(check)

  // Navigator checks
  detectLowBattery(check)
  detectInsufficientVerticalHeight(check)
  detectLowColourDisplays(check)
}

function detectWrongNumberOfAnswers (check) {
  const numberOfQuestions = check.data.questions.length
  const numberOfAnswers = check.data.answers.length
  if (numberOfAnswers !== numberOfQuestions) {
    report(check.checkCode, 'Wrong number of answers', numberOfAnswers, numberOfQuestions)
  }
}

function detectWrongNumberOfInputs (check) {
  const numberOfQuestions = check.data.questions.length
  const numberOfInputs = check.data.inputs.length
  if (numberOfInputs !== numberOfQuestions) {
    report(check.checkCode, 'Wrong number of inputs', numberOfInputs, numberOfQuestions)
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
  if (battery.levelPercent < 20) {
    report(check.checkCode, 'Low battery', '' + battery.levelPercent + '%', '> 20%')
  }
}

function detectInputBeforeOrAfterTheQuestionIsShown (check) {
  // For each question we need to check that the inputs were not
  // received before the question was shown, or after the question
  // should have been closed.
  // const questionTimeLimit = check.data.config.questionTimeLimit
  const questions = check.data.questions
  questions.forEach(question => {
    const questionRenderedEvent = check.data.audit.find(e => e.type === 'QuestionRendered' && e.data && e.data.sequenceNumber === question.order)
    if (!questionRenderedEvent) {
      return report(check.checkCode, `QuestionRenderedEvent not found for Q${question.order}`)
    }
    const questionShownAt = moment(questionRenderedEvent.clientTimestamp)
    if (!questionShownAt.isValid()) {
      return report(check.checkCode, 'QuestionRendered Timestamp is not valid', questionRenderedEvent.clientTimestamp, 'Valid ts')
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
        report(check.checkCode, 'Input fails property check', input.question, question.order)
      }
      const inputTimeStamp = moment(input.clientInputDate)
      if (inputTimeStamp.isBefore(questionShownAt)) {
        report(check.checkCode, `Input received before Question ${question.order} shown`, input.clientInputDate, questionRenderedEvent.clientTimestamp)
      }
      // We shouldn't have any input after the QuestionRendered ts + the question time-limit
      if (inputTimeStamp.isAfter(questionCutoffAt)) {
        report(check.checkCode, `Input received after Question ${question.order} cut-off`, input.clientInputDate, dateService.formatIso8601(questionCutoffAt))
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
    report(check.checkCode, 'Wrong number of QuestionRendered audits', questionRenderedAudits.length, numberOfQuestions + numberOfPractiseQuestions)
  }

  const pauseRenderedAudits = check.data.audit.filter(audit => audit.type === 'PauseRendered')
  if (pauseRenderedAudits.length !== numberOfQuestions + numberOfPractiseQuestions) {
    report(check.checkCode, 'Wrong number of PauseRendered audits', pauseRenderedAudits.length, numberOfQuestions + numberOfPractiseQuestions)
  }

  const detectMissingSingleAudit = function (auditType) {
    // Detect events should occur only once
    const audit = check.data.audit.find(audit => audit.type === auditType)
    if (!audit) {
      report(check.checkCode, `Missing audit ${auditType}`)
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
    report(check.checkCode, 'Insufficient browser vertical height', height, '> 558 pixels')
  } else if (width > 640 && width < 769 && height < 700) {
    report(check.checkCode, 'Insufficient browser vertical height', height, '> 700 pixels')
  } else if (width > 769 && height < 660) {
    report(check.checkCode, 'Insufficient browser vertical height', height, '> 660 pixels')
  }
}

function detectLowColourDisplays (check) {
  const colourDepth = check.data.device.screen.colorDepth
  if (colourDepth < 24) {
    report(check.checkCode, 'Low colour display', colourDepth, '24')
  }
}

function report (checkCode, message, testedValue = null, expectedValue = null) {
  anomalyCount += 1
  reportedAnomalies.push([checkCode, message, testedValue, expectedValue])
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
  ws.write('Check Code,Message,Tested value,Expected value\n')
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
