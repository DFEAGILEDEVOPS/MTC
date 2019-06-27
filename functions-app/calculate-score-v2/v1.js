'use strict'

const moment = require('moment')

const config = require('../config')
const checkWindowDataService = require('./check-window.data.service')
const schoolScoresDataService = require('./schools-scores.data.service')
const pupilResultsDiagnosticCache = require('./pupil-results-diagnostic-cache.data.service')
const redisCacheService = require('../lib/redis-cache.service')

let logger

const v1 = {
  process: async function (context) {
    logger = context.log
    redisCacheService.setLogger(logger)
    await calculateSchoolResults(context)
  }
}

async function calculateSchoolResults (context) {
  const liveCheckWindow = await checkWindowDataService.sqlFindCalculationPeriodCheckWindow()

  // Terminate execution if a check window is not within the calculation period
  if (!liveCheckWindow || !liveCheckWindow.id) {
    context.log(`calculate-score-v2 v1: Live check window not found`)
    return
  }

  const schoolIds = await schoolScoresDataService.sqlFindSchoolIds()

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
      const pupilResultData = await schoolScoresDataService.sqlExecuteGetSchoolScores(liveCheckWindow.id, schoolId)
      const generatedAt = moment.utc()
      const rawPayload = { generatedAt, pupilResultData }
      await pupilResultsDiagnosticCache.sqlInsert(schoolId, rawPayload)
      await redisCacheService.set(`result:${schoolId}`, rawPayload, { expires: config.REDIS_RESULTS_EXPIRY_IN_SECONDS })
    } catch (error) {
      context.log.error(`calculate-score-v2 v1: ${error}`)
    }
  })
}

module.exports = v1
