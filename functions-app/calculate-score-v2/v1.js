'use strict'

const checkWindowDataService = require('./check-window.data.service')
const schoolScoresDataService = require('./schools-scores.data.service')

const v1 = {
  process: async function (context) {
    await handleStoreSchoolsScores(context)
  }
}

async function handleStoreSchoolsScores (context) {
  const liveCheckWindow = await checkWindowDataService.sqlFindCalculationPeriodCheckWindow()

  // Terminate execution if a check window is not within the calculation period
  if (!liveCheckWindow || !liveCheckWindow.id) {
    context.log(`calculate-score-v2 v1: Live check window not found`)
    return
  }

  await schoolScoresDataService.sqlExecuteStoreSchoolScoresStoreProcedure(liveCheckWindow.id)
}

module.exports = v1
