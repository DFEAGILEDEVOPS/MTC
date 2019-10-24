'use strict'
const { isArray } = require('ramda-adjunct')
const { prop, assoc } = require('ramda')
const moment = require('moment')
const jsFormat = 'Y-MM-DDTHH:mm:ss.SSSZ'

/**
 * Retrieve an answer from the answers array.  Populates the timestamp with a moment object.
 * Either returns a clone (if transformation is required) or the original object from the array.
 * @param {Object[]}answers
 * @param {Number} questionNumber
 * @return {Object|undefined}
 */
const getAnswer = function getAnswer (answers, questionNumber) {
  if (!isArray(answers)) { return }
  const ans = answers[questionNumber - 1]
  // sense check
  if (prop('sequenceNumber', ans) !== questionNumber) { return } // invalid
  // convert the string timestamp to a moment object
  const stringTs = prop('clientTimestamp', ans)
  if (stringTs) {
    const momentTs = moment(stringTs, jsFormat, true)
    if (momentTs.isValid()) {
      return assoc('momentTimestamp', momentTs, ans)
    }
  }
  return ans
}

module.exports = getAnswer
