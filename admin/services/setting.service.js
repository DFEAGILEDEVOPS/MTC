'use strict'

const settingDataService = require('./data-access/setting.data.service')
const settingLogDataService = require('./data-access/setting-log.data.service')
const config = require('../config')

const settingService = {}

/**
 * Update check settings
 * @param {number} loadingTimeLimit
 * @param {number} questionTimeLimit
 * @param {number} checkTimeLimit
 * @param {number} userId
 */

settingService.update = async (loadingTimeLimit, questionTimeLimit, checkTimeLimit, userId) => {
  const questionLimitRounded = Math.round(questionTimeLimit * 100) / 100
  const loadingLimitRounded = Math.round(loadingTimeLimit * 100) / 100
  const checkLimitRounded = Math.round(checkTimeLimit)
  await settingDataService.sqlUpdate(loadingLimitRounded, questionLimitRounded, checkLimitRounded)
  await settingLogDataService.sqlCreate(loadingLimitRounded, questionLimitRounded, checkLimitRounded, userId)
}

/**
 * Get check settings
 * @param {Boolean} cacheBust
 * @returns {questionTimeLimit: number, loadingTimeLimit: number, checkTimeLimit: number}
 */
let cachedSettings
settingService.get = async (cacheBust = false) => {
  if (cacheBust || !cachedSettings) {
    cachedSettings = await settingDataService.sqlFindOne()
  }
  if (!cachedSettings) {
    cachedSettings = {
      questionTimeLimit: config.QUESTION_TIME_LIMIT,
      loadingTimeLimit: config.TIME_BETWEEN_QUESTIONS,
      checkTimeLimit: config.LENGTH_OF_CHECK_MINUTES
    }
  }
  return cachedSettings
}

module.exports = settingService
