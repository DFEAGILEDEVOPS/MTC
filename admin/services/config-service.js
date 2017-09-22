'use strict'
const Setting = require('../models/setting')
const {QUESTION_TIME_LIMIT, TIME_BETWEEN_QUESTIONS} = require('../config')

/** @namespace */

const configService = {

  getConfig: async () => {
    let questionTime = QUESTION_TIME_LIMIT
    let loadingTime = TIME_BETWEEN_QUESTIONS

    try {
      const timeSettings = await Setting.findOne().exec()
      if (timeSettings) {
        loadingTime = timeSettings.loadingTimeLimit
        questionTime = timeSettings.questionTimeLimit
      }
    } catch (error) {
      console.error('There was an error retrieving custom timings: ' + error.message)
      throw (error)
    }

    return {
      questionTime,
      loadingTime
    }
  }

}

module.exports = configService
