'use strict'

const settingDataService = require('./data-access/setting.data.service')
const settingLogDataService = require('./data-access/setting-log.data.service')
const redisCacheService = require('./data-access/redis-cache.service')
const config = require('../config')
const redisKeyService = require('./redis-key.service')

const settingService = {}

const settingsRedisKey = redisKeyService.getSettingsKey()

/**
 * Update check settings
 * @param {{questionTimeLimit: number, loadingTimeLimit: number, checkTimeLimit: number, isPostAdminEndDateUnavailable: boolean}} newSettings
 * @param {number} userId
 */

settingService.update = async (newSettings, userId) => {
  const questionTimeLimit = Math.round(newSettings.questionTimeLimit * 100) / 100
  const loadingTimeLimit = Math.round(newSettings.loadingTimeLimit * 100) / 100
  const checkTimeLimit = Math.round(newSettings.checkTimeLimit)
  await settingDataService.sqlUpdate(loadingTimeLimit, questionTimeLimit, checkTimeLimit, newSettings.isPostAdminEndDateUnavailable)
  await settingLogDataService.sqlCreate(loadingTimeLimit, questionTimeLimit, checkTimeLimit, newSettings.isPostAdminEndDateUnavailable, userId)
  return redisCacheService.drop(settingsRedisKey)
}

/**
 * Check Settings Object
 * @typedef {Object} CheckSettings
 * @property {number} loadingTimeLimit - time in seconds between questions
 * @property {number} checkTimeLimit - total allowed check time in minutes
 * @property {number} questionTimeLimit - time in seconds allowed for each question to be displayed
 * @property {boolean} isPostAdminEndDateUnavailable - set to false to allow the site to run in read-only mode after the admin end date, or true to make the site unavailable.
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
      checkTimeLimit: config.LENGTH_OF_CHECK_MINUTES,
      isPostAdminEndDateUnavailable: false
    }
  }
  await redisCacheService.set(settingsRedisKey, settings)
  return settings
}

module.exports = settingService
