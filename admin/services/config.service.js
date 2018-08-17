'use strict'

const R = require('ramda')
const winston = require('winston')

const accessArrangementsService = require('./access-arrangements.service')
const pupilAccessArrangementsDataService = require('./data-access/pupil-access-arrangements.data.service')
const settingDataService = require('./data-access/setting.data.service')
const groupDataService = require('./data-access/group.data.service')
const {QUESTION_TIME_LIMIT, TIME_BETWEEN_QUESTIONS} = require('../config')
const monitor = require('../helpers/monitor')

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

    const timeSettings = await settingDataService.sqlFindOne()
    const group = await groupDataService.sqlFindOneGroupByPupilId(pupil.id)
    const hasGroupTimeLimits = group && group.loadingTimeLimit && group.questionTimeLimit
    if (hasGroupTimeLimits) {
      loadingTime = group.loadingTimeLimit
      questionTime = group.questionTimeLimit
    } else if (timeSettings) {
      loadingTime = timeSettings.loadingTimeLimit
      questionTime = timeSettings.questionTimeLimit
    }

    const config = {
      questionTime,
      loadingTime
    }

    // specific config for a pupil
    const checkOptions = {
      speechSynthesis: !!pupil.speechSynthesis,
      audibleSounds: false
    }

    let accessArrangements
    let pupilAccessArrangements
    try {
      accessArrangements = await accessArrangementsService.getAccessArrangements()
      pupilAccessArrangements = await pupilAccessArrangementsDataService.sqlFindAccessArrangementsByPupilId(pupil.id)
    } catch (error) {
      winston.error('Failed to get access arrangements: ' + error.message)
    }

    // remap codes as an array of [id]: code for faster lookups
    const accessArrangementsCodes = accessArrangements.reduce((memo, aa) => ({ ...memo, [aa.id]: aa.code }), {})

    if (pupilAccessArrangements && pupilAccessArrangements['accessArrangements_ids']) {
      const pupilAccessArrangementsCodes = JSON.parse(pupilAccessArrangements['accessArrangements_ids'])
        .map(id => accessArrangementsCodes[id])

      if (pupilAccessArrangementsCodes.includes('ATA')) {
        checkOptions.audibleSounds = true
      }
    }

    return R.merge(config, checkOptions)
  }
}

module.exports = monitor('config.service', configService)
