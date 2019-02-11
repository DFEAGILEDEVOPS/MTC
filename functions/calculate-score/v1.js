'use strict'

const scoreCalculationDataService = require('./score-calculation.data.service')

const v1 = {
  process: async function (context) {
    await handleCalculateScore(context)
  }
}

async function handleCalculateScore (context) {
  const liveCheckWindow = await scoreCalculationDataService.sqlFindCalculationPeriodCheckWindow()

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

  // Fetch schools with scores for the relevant check window
  const schoolsWithScores = await scoreCalculationDataService.sqlFindCheckWindowSchoolAverageScores()

  if (!schoolsWithScores || !Array.isArray(schoolsWithScores)) {
    context.log.error(`no schools with scores found or not in valid format for check window id: ${liveCheckWindow.id}`)
    return
  }

  if (schoolsWithScores.length === 0) {
    context.log.error(`calculate-score: no schools were found for ${liveCheckWindow.id}`)
    return
  }

  // store school scores
  return scoreCalculationDataService.sqlInsertSchoolScores(liveCheckWindow.id)
}

module.exports = v1
