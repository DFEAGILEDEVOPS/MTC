#!/usr/bin/env node
'use strict'

const mongoose = require('mongoose')
mongoose.promise = global.Promise
// const LogonEvent = require('../models/logon-event')
const Answers = require('../models/answer')
require('../models/pupil')
require('../models/school')
const csv = require('fast-csv')
const fs = require('fs')
const csvStream = csv.createWriteStream({headers: true})
const moment = require('moment')
const fileNow = moment().format('YYYYMMDD')
const writableStream = fs.createWriteStream(`psychometrician-report-${fileNow}.csv`, {headers: true})

writableStream.on('finish', function () {
  console.error('DONE!')
})

csvStream.pipe(writableStream)

mongoose.connect(process.env.MONGO_CONNECTION_STRING, async function (error) {
  if (error) { console.error(error) }

  const answers = []

  // extract all complete or incomplete answers, by fetching the last answer for that test
  // 1st we need all testIds
  const testIds = await Answers.distinct('testId').exec()
  console.log(`Got ${testIds.length} distinct checks`)

  let count = 0
  for (let testId of testIds) {
    const answer = await Answers.findOne({testId: testId}).sort({createdAt: -1}).populate('pupil school').lean().exec()
    count += 1
    if (count % 100 === 0) {
      console.log(`retrieved ${count} answers`)
    }
    answers.push(answer)
  }
  console.log(`Got ${answers.length} answers`)
  for (let answer of answers) {
    // Due to lot's of double-clicking etc we need to re-mark the results
    answer = markResults(cleanDups(answer))
    const row = getRow(answer)
    csvStream.write(row, {quoteColumns: {'Check Id': true}})
  }
  csvStream.end()
  mongoose.connection.close()
})

function getRow (answer) {
  // const answersLength = answer.answers.length
  // const lastAnswer = answer.answers[answersLength - 1]
  const obj = {
    'AttemptId': answer.testId,
    'FakeDob': moment(answer.pupil.dob).format('DD/MM/YYYY'),
    'estab': answer.school.estabCode,
    'FakeForename': 'Pupil',
    'FormMark': answer.result ? answer.result.correct : 'n/a',
    'FakeGender': answer.pupil.gender,
    'hardwareid': '',
    'lanum': answer.school.leaCode,
    'middlenames': '',
    'PupilId': '',
    'schnam': answer.school.name,
    'schoolurn': answer.school.upn,
    'FakeSurname': 'Pupil',
    'T1attend': 2,
    'T1attend_AR': '',
    'T1Name': 'June Trial',
    'TestDate': moment(answer.creationDate).format('YYYYMMDD'),
    'TimeComplete': moment(answer.pupil.checkEndDate).format('h:mm:ss a'),
    'TimeStart': moment(answer.pupil.checkStartDate).format('h:mm:ss a'),
    'TimeTaken': moment(moment(answer.pupil.checkEndDate).diff(moment(answer.pupil.checkStartDate))).format('HH:mm:ss'),
    'AppId': answer.isElectron ? 'electron' : 'web'
  }
  const p = (idx) => { return 'Q' + (idx + 1).toString() }
  answer.answers.forEach((ans, idx) => {
    obj[p(idx) + 'ID'] = ans.factor1 + ' x ' + ans.factor2
    obj[p(idx)] = ans.input
    obj[p(idx) + 'k'] = getUserInput(ans)
    obj[p(idx) + 'sco'] = ans.isCorrect ? 1 : 0
    obj[p(idx) + 't'] = getFirstResponseTime(ans)
    obj[p(idx) + 'to'] = hasTimeoutFlag(ans)
    obj[p(idx) + 'rt'] = getResponseTime(ans)
    obj[p(idx) + 'im'] = getInputMethod(ans) // k = keyboard, m = mouse, t = touch or mouse, m = mixed
  })
  return obj
}

function markResults (answer) {
  let count = 0

  answer.answers.forEach(function (e) {
    const correctAnswer = e.factor1 * e.factor2
    if ((e.input * 1) === correctAnswer) {
      e.isCorrect = true
      count += 1
    } else {
      e.isCorrect = false
    }
  })

  answer.result = {
    correct: count
  }
  return answer
}

function cleanDups (answer) {
  const seen = {}
  const cleanedAnswers = []

  answer.answers.forEach(ans => {
    const key = ans.factor1 + 'x' + ans.factor2
    if (seen[key]) {
      return
    }
    seen[key] = true
    cleanedAnswers.push(ans)
  })
  if (cleanedAnswers.length > 30) { console.log(`Got more than 30 answers`) }
  answer.answers = cleanedAnswers
  return answer
}

function getUserInput (answer) {
  const output = []
  const baseTime = moment(answer.pageLoadDate)
  answer.registeredInputs.forEach(inp => {
    let ident = ''
    const inputTime = moment(inp.clientInputDate)
    const relTime = moment(inputTime.diff(baseTime)).format('+s.SSS\\s')

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
        // Mouse or fingers on a screen
        ident = 't'
        break
      default:
        console.log('Unknown input type: ' + inp.eventType)
        console.log('inp ', inp)
        ident = 'u'
        break
    }
    output.push(`${relTime} ${ident}[${inp.input}]`)
  })
  return output.join(', ')
}

function getFirstResponseTime (answer) {
  if (answer.registeredInputs && answer.registeredInputs.length) {
    const baseTime = moment(answer.pageLoadDate)
    const inputTime = moment(answer.registeredInputs[0].clientInputDate)
    const relTime = moment(inputTime.diff(baseTime)).format('s.SSS')
    return relTime
  }
  return ''
}

function hasTimeoutFlag (answer) {
  let timeout = 1
  if (answer.registeredInputs && answer.registeredInputs.length) {
    const last = answer.registeredInputs[answer.registeredInputs.length - 1]
    if (last.input === 'enter') {
      timeout = 0
    }
  }
  return timeout
}

function getResponseTime (answer) {
  if (!(answer.registeredInputs && answer.registeredInputs.length)) {
    return ''
  }
  const firstInput = answer.registeredInputs[0].clientInputDate
  const lastInput = answer.registeredInputs[answer.registeredInputs.length - 1].clientInputDate
  return moment(moment(lastInput).diff(moment(firstInput))).format('s.SSS')
}

function getInputMethod (answer) {
  if (!(answer.registeredInputs && answer.registeredInputs.length)) {
    return ''
  }
  const inputMethods = new Set()
  for (const ri of answer.registeredInputs) {
    switch (ri.eventType) {
      case 'keydown':
      case 'touch keydown':
        // hardware keyboard was pressed
        inputMethods.add('k')
        break
      case 'click':
      case 'mousedown':
        // Mouse was pressed
        inputMethods.add('m')
        break
      case 'touch click':
      case 'touch mousedown':
        // Mouse or fingers on a screen
        inputMethods.add('t')
        break
      default:
        console.log('Unknown input type: ' + ri.eventType)
        console.log('inp ', ri)
        inputMethods.add('u')
        break
    }
  }
  const deduped = Array.from(inputMethods)
  if (deduped.length === 0) {
    return ''
  } else if (deduped.length === 1) {
    return deduped[0]
  } else {
    return 'x'
  }
}
