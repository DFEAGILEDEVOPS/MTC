'use strict'

const checkWindowDataService = require('./check-window.data.service')
const schoolScoresDataService = require('./schools-scores.data.service')
const schoolDataService = require('./school.data.service')
const pupilResultsDiagnosticCache = require('./pupil-results-diagnostic-cache.data.service')

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

  const schoolIds = await schoolDataService.sqlFindSchoolIds()

  // Terminate execution if no school ids are found
  if (!schoolIds || !Array.isArray(schoolIds) || schoolIds.length === 0) {
    context.log(`calculate-score-v2 v1: school ids not found`)
    return
  }

  // Delete records from pupilResultsDiagnosticCache table
  await pupilResultsDiagnosticCache.sqlDelete()

  // Iterate for each school id and store data in sql cache table and redis
  schoolIds.forEach(async schoolId => {
    const schoolResultData = await schoolScoresDataService.sqlExecuteGetSchoolScoresStoreProcedure(liveCheckWindow.id, schoolId)
    const payload = JSON.stringify(schoolResultData)
    await pupilResultsDiagnosticCache.sqlInsert(schoolId, payload)
    // TODO: store in redis
  })
}

module.exports = v1
