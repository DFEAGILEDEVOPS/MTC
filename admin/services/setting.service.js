'use strict'

const settingDataService = require('./data-access/setting.data.service')
const settingLogDataService = require('./data-access/setting-log.data.service')
const redisCacheService = require('./data-access/redis-cache.service')
const config = require('../config')

const settingService = {}

const settingsRedisKey = 'settings'

/**
 * Update check settings
 * @param {number} updatedLoadingTimeLimit
 * @param {number} updatedQuestionTimeLimit
 * @param {number} updatedCheckTimeLimit
 * @param {number} userId
 */

settingService.update = async (updatedLoadingTimeLimit, updatedQuestionTimeLimit, updatedCheckTimeLimit, userId) => {
  const questionTimeLimit = Math.round(updatedQuestionTimeLimit * 100) / 100
  const loadingTimeLimit = Math.round(updatedLoadingTimeLimit * 100) / 100
  const checkTimeLimit = Math.round(updatedCheckTimeLimit)
  await settingDataService.sqlUpdate(loadingTimeLimit, questionTimeLimit, checkTimeLimit)
  await settingLogDataService.sqlCreate(loadingTimeLimit, questionTimeLimit, checkTimeLimit, userId)
  const settings = { loadingTimeLimit, questionTimeLimit, checkTimeLimit }
  return redisCacheService.set(settingsRedisKey, settings)
}

/**
 * Check Settings Object
 * @typedef {Object} CheckSettings
 * @property {number} questionTimeLimit - time in seconds allowed for each question to be displayed
 * @property {number} loadingTimeLimit - time in seconds between questions
 * @property {number} checkTimeLimit - total allowed check time in minutes
 */

/**
 * @description Get check settings
 * @returns {Promise<CheckSettings>}
 */
settingService.get = async () => {
  const cachedSettings = await redisCacheService.get(settingsRedisKey)
  if (cachedSettings) {
    return cachedSettings
  }
  let settings = await settingDataService.sqlFindOne()
  if (!settings) {
    settings = {
      questionTimeLimit: config.QUESTION_TIME_LIMIT,
      loadingTimeLimit: config.TIME_BETWEEN_QUESTIONS,
      checkTimeLimit: config.LENGTH_OF_CHECK_MINUTES
    }
  }
  await redisCacheService.set(settingsRedisKey, settings)
  return settings
}

module.exports = settingService
