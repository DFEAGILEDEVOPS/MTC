'use strict'

const moment = require('moment')
const scoreCalculationDataService = require('./score-calculation.data.service')
const checkWindowDataService = require('./check-window.data.service')

const v1 = {
  process: async function (context) {
    await handleCalculateScore(context)
  }
}

async function handleCalculateScore (context) {
  const liveCheckWindow = await checkWindowDataService.sqlFindCalculationPeriodCheckWindow()

  // Terminate execution if a check window is not within the calculation period
  if (!liveCheckWindow || !liveCheckWindow.id) {
    context.log(`calculate-score: Live check window not found`)
    return
  }

  // Terminate execution if relevant check window is finalised
  if (liveCheckWindow.complete) {
    context.log(`calculate-score: National score has been calculated for check window id ${liveCheckWindow.id}`)
    return
  }

  // Flag check window as complete when admin check end date has passed
  const currentUTCDate = moment.utc()
  if (currentUTCDate.isAfter(liveCheckWindow.adminEndDate)) {
    await checkWindowDataService.sqlMarkCheckWindowAsComplete(liveCheckWindow.id)
  }

  // Fetch schools with scores for the relevant check window
  const schoolsWithScores = await scoreCalculationDataService.sqlFindCheckWindowSchoolAverageScores()

  if (!schoolsWithScores || !Array.isArray(schoolsWithScores)) {
    context.log.error(`No schools with scores found or not in valid format for check window id: ${liveCheckWindow.id}`)
    return
  }

  if (schoolsWithScores.length === 0) {
    context.log.error(`calculate-score: No schools were found for ${liveCheckWindow.id}`)
    return
  }

  // Store school scores
  await scoreCalculationDataService.sqlInsertSchoolScores(liveCheckWindow.id)

  // Store national average in check window score
  return scoreCalculationDataService.sqlInsertCheckWindowScore(liveCheckWindow.id)
}

module.exports = v1
