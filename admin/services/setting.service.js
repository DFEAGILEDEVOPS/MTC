'use strict'

const settingDataService = require('./data-access/setting.data.service')
const settingLogDataService = require('./data-access/setting-log.data.service')
const config = require('../config')
const monitor = require('../helpers/monitor')

const settingService = {}

/**
 * Update check settings
 * @param {number} loadingTimeLimit
 * @param {number} questionTimeLimit
 * @param {number} userId
 */

settingService.update = async (loadingTimeLimit, questionTimeLimit, userId) => {
  const questionLimitRounded = Math.round(questionTimeLimit * 100) / 100
  const loadingLimitRounded = Math.round(loadingTimeLimit * 100) / 100
  settingDataService.sqlUpdate(loadingLimitRounded, questionLimitRounded)
  settingLogDataService.sqlCreate(loadingLimitRounded, questionLimitRounded, userId)
}

/**
 * Get check settings
 * @returns {Object}
 */
settingService.get = async () => {
  let settings = settingDataService.sqlFindOne()
  if (!settings) {
    settings = {
      'questionTimeLimit': config.QUESTION_TIME_LIMIT,
      'loadingTimeLimit': config.TIME_BETWEEN_QUESTIONS
    }
  }
  return settings
}

module.exports = monitor('setting.service', settingService)
