'use strict'

const R = require('ramda')

const settingDataService = require('./data-access/setting.data.service')
const {QUESTION_TIME_LIMIT, TIME_BETWEEN_QUESTIONS} = require('../config')

/** @namespace */

const configService = {

  /**
   * Fetch the config for a particular pupil for a test
   * @param {Object} pupil - plain pupil object
   * @return {Promise.<{questionTime: *, loadingTime: *, speechSynthesis: boolean}>}
   */
  getConfig: async (pupil) => {
    let questionTime = QUESTION_TIME_LIMIT
    let loadingTime = TIME_BETWEEN_QUESTIONS

    const timeSettings = await settingDataService.findOne({})

    if (timeSettings) {
      loadingTime = timeSettings.loadingTimeLimit
      questionTime = timeSettings.questionTimeLimit
    }

    const config = {
      questionTime,
      loadingTime
    }

    return R.merge(config, pupil.checkOptions)
  }
}

module.exports = configService
