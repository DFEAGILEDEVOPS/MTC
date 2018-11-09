'use strict'

const R = require('ramda')
const winston = require('winston')

const accessArrangementsDataService = require('./data-access/access-arrangements.data.service')
const pupilAccessArrangementsDataService = require('./data-access/pupil-access-arrangements.data.service')
const settingDataService = require('./data-access/setting.data.service')
const groupDataService = require('./data-access/group.data.service')
const { QUESTION_TIME_LIMIT, TIME_BETWEEN_QUESTIONS } = require('../config')

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
      audibleSounds: false,
      inputAssistance: false,
      numpadRemoval: false,
      fontSize: false,
      colourContrast: false,
      questionReader: false
    }

    let pupilAccessArrangements
    let accessArrangementsCodes
    let fontSizeAccessArrangement
    let colourContrastAccessArrangement
    try {
      pupilAccessArrangements = await pupilAccessArrangementsDataService.sqlFindPupilAccessArrangementsByPupilId(pupil.id)
      if (pupilAccessArrangements && pupilAccessArrangements.length) {
        const accessArrangementsIds = pupilAccessArrangements.map(aa => aa['accessArrangements_id'])
        fontSizeAccessArrangement = pupilAccessArrangements.find(aa => aa.pupilFontSizeCode)
        colourContrastAccessArrangement = pupilAccessArrangements.find(aa => aa.pupilColourContrastCode)
        accessArrangementsCodes = await accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds(accessArrangementsIds)
      } else {
        accessArrangementsCodes = []
      }
    } catch (error) {
      winston.error('Failed to get access arrangements: ' + error.message)
    }

    accessArrangementsCodes.forEach(code => {
      if (code === accessArrangementsDataService.CODES.AUDIBLE_SOUNDS) checkOptions.audibleSounds = true
      if (code === accessArrangementsDataService.CODES.INPUT_ASSISTANCE) checkOptions.inputAssistance = true
      if (code === accessArrangementsDataService.CODES.NUMPAD_REMOVAL) checkOptions.numpadRemoval = true
      if (code === accessArrangementsDataService.CODES.FONT_SIZE) {
        checkOptions.fontSize = true
        checkOptions.fontSizeCode = fontSizeAccessArrangement && fontSizeAccessArrangement.pupilFontSizeCode
      }
      if (code === accessArrangementsDataService.CODES.COLOUR_CONTRAST) {
        checkOptions.colourContrast = true
        checkOptions.colourContrastCode = colourContrastAccessArrangement && colourContrastAccessArrangement.pupilColourContrastCode
      }
      if (code === accessArrangementsDataService.CODES.QUESTION_READER) checkOptions.questionReader = true
    })

    return R.merge(config, checkOptions)
  }
}

module.exports = configService
