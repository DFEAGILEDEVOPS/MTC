#!/usr/bin/env node
'use strict'

const mongoose = require('mongoose')
mongoose.promise = global.Promise
// const LogonEvent = require('../models/logon-event')
const Answers = require('../models/answer')
const Pupil = require('../models/pupil')
const School = require('../models/school')
const csv = require('fast-csv')
const fs = require('fs')
const csvStream = csv.createWriteStream({headers: true})
const moment = require('moment')
const writableStream = fs.createWriteStream('out.csv', {headers: true})

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
  const obj = {
    'Date': moment(answer.answers[0].answerDate).format('YYYY-MM-DD HH:mm'),
    'Pupil': answer.pupil.foreName + ' ' + answer.pupil.lastName,
    'Pupil Id': answer.pupil._id,
    'School': answer.school.name,
    'School Id': answer.school._id,
    'URN': answer.school.upn,
    'App type': answer.isElectron ? 'Electron' : 'Web',
    'Marks': answer.result ? answer.result.correct : 'n/a',
    'Number of Questions Answered': answer.answers.length,
    'Answer Id': answer._id.toString(),
    'Check Id': answer.testId
  }
  answer.answers.forEach((ans, idx) => {
    obj['Q' + (idx + 1).toString()] = ans.factor1 + ' x ' + ans.factor2
    obj['A' + (idx + 1).toString()] = ans.input
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
