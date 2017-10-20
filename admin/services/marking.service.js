'use strict'

const completedCheckDataService = require('./data-access/completed-check.data.service')
const checkDataService = require('./data-access/check.data.service')
const markingService = {}

markingService.batchMark = async function (batchIds) {
  if (!batchIds) {
    throw new Error('Missing arg batchIds')
  }
  if (!batchIds.length) {
    throw new Error('No documents to mark')
  }

  const completedChecks = await completedCheckDataService.find({_id: {'$in': batchIds}})

  for (let cc of completedChecks) {
    try {
      this.mark(cc)
    } catch (error) {
      console.error('Error marking document: ', error)
      // We can ignore this error and re-try the document again.
      // ToDo: add a count to the document of the number of processing attempts?
    }
  }
}

markingService.mark = async function (completedCheck) {
  if (!(completedCheck && completedCheck.data && completedCheck.data.answers)) {
    throw new Error('missing or invalid argument')
  }

  const results = {
    marks: 0,
    maxMarks: completedCheck.data.answers.length,
    processedAt: new Date()
  }

  for (let answer of completedCheck.data.answers) {
    if (answer.factor1 * answer.factor2 === parseInt(answer.answer, 10)) {
      answer.isCorrect = true
      results.marks += 1
    } else {
      answer.isCorrect = false
    }
  }
  completedCheck.isMarked = true
  completedCheck.markedAt = new Date()

  // Update the completed check
  await completedCheckDataService.save(completedCheck)

  // update the check meta info
  await checkDataService.update({checkCode: completedCheck.data.pupil.checkCode}, {'$set': {results: results}})
}

module.exports = markingService
