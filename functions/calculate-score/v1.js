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

  // Excute score calculation store procedure
  await scoreCalculationDataService.sqlExecuteScoreCalculationStoreProcedure(liveCheckWindow.id)
}

module.exports = v1
