const checkDataService = require('./data-access/check.data.service')

const scoreService = {}

/**
 * Returns the score of a pupil's check.
 * @param {String} pupilId
 * @returns {String}
 */
scoreService.getScorePercentage = async (pupilId) => {
  // find the score, if they have one
  const latestCheck = await checkDataService.sqlFindLatestCheck(pupilId)
  let score
  if (latestCheck && latestCheck.results) {
    // calculate percentage
    score = scoreService.calculateScorePercentage(latestCheck.results) + '%'
  } else {
    score = 'N/A'
  }
  return score
}

/**
 * Calculates the score of a check that a pupil has taken.
 * @param {object} results - The check results.
 */
scoreService.calculateScorePercentage = (results) => {
  const errorMessage = 'Error Calculating Score'
  if (!results) return undefined

  if (results.marks === undefined || results.maxMarks === undefined) {
    return errorMessage
  }

  if (results.marks > results.maxMarks) {
    return errorMessage
  }

  let percentage = (results.marks / results.maxMarks) * 100
  var rounded = Math.round(percentage * 10) / 10
  return rounded
}

module.exports = scoreService
