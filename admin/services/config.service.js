'use strict'
const Setting = require('../models/setting')
const {QUESTION_TIME_LIMIT, TIME_BETWEEN_QUESTIONS} = require('../config')

/** @namespace */

const configService = {

  getConfig: async () => {
    let questionTime = QUESTION_TIME_LIMIT
    let loadingTime = TIME_BETWEEN_QUESTIONS

    const timeSettings = await Setting.findOne().exec()

    if (timeSettings) {
      loadingTime = timeSettings.loadingTimeLimit
      questionTime = timeSettings.questionTimeLimit
    }

    return {
      questionTime,
      loadingTime
    }
  }
}

module.exports = configService
