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
    context.log('calculate-score: Check window calculation already complete. Bypassing calculation run')
    return
  }

  // Flag check window as complete when admin end date is the day of function execution
  const currentUTCDate = moment.utc()
  if (currentUTCDate.diff(liveCheckWindow.checkEndDate, 'days') === 1) {
    await checkWindowDataService.sqlMarkCheckWindowAsComplete(liveCheckWindow.id)
  }

  // Call refresh score data store procedure
  // The SP stores score data into school score table and stores the national average into the check window score column
  await scoreCalculationDataService.sqlExecuteScoreCalculationStoreProcedure(liveCheckWindow.id)
}

module.exports = v1
