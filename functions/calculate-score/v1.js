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
    return
  }

  // Call refresh score data store procedure
  // The SP stores score data into school score table and stores the national average into the check window score column
  await scoreCalculationDataService.sqlExecuteScoreCalculationStoreProcedure(liveCheckWindow.id)
}

module.exports = v1
