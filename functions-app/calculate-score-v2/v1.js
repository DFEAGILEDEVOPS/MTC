'use strict'

const config = require('../config')
const checkWindowDataService = require('./check-window.data.service')
const schoolScoresDataService = require('./schools-scores.data.service')
const schoolDataService = require('./school.data.service')
const pupilResultsDiagnosticCache = require('./pupil-results-diagnostic-cache.data.service')
const redisCacheService = require('../lib/redis-cache.service')

let logger

const v1 = {
  process: async function (context) {
    logger = context.log
    redisCacheService.setLogger(logger)
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
    try {
      const result = await schoolScoresDataService.sqlExecuteGetSchoolScoresStoreProcedure(liveCheckWindow.id, schoolId)
      await pupilResultsDiagnosticCache.sqlInsert(schoolId, result)
      await redisCacheService.set(`result:${schoolId}`, result, { expires: config.REDIS_RESULTS_EXPIRY_IN_SECONDS })
    } catch (error) {
      context.log.error(`calculate-score-v2 v1: ${error}`)
    }
  })
}

module.exports = v1
