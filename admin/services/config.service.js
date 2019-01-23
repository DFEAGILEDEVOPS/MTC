'use strict'

const R = require('ramda')
const logger = require('./log.service').getLogger()

const accessArrangementsDataService = require('./data-access/access-arrangements.data.service')
const pupilAccessArrangementsDataService = require('./data-access/pupil-access-arrangements.data.service')
const settingDataService = require('./data-access/setting.data.service')
const { QUESTION_TIME_LIMIT, TIME_BETWEEN_QUESTIONS, LENGTH_OF_CHECK_MINUTES } = require('../config')
const configDataService = require('./data-access/config.data.service')

/** @namespace */

const configService = {
  getQuestionSettings: async function getQuestionSettings () {
    let questionTime = QUESTION_TIME_LIMIT
    let loadingTime = TIME_BETWEEN_QUESTIONS

    const timeSettings = await settingDataService.sqlFindOne()

    if (timeSettings) {
      loadingTime = timeSettings.loadingTimeLimit
      questionTime = timeSettings.questionTimeLimit
    }

    // There is no property on the db: mtc_admin.settings.checkTimeLimit
    const checkTime = timeSettings ? timeSettings.checkTimeLimit : LENGTH_OF_CHECK_MINUTES

    const config = {
      questionTime,
      loadingTime,
      checkTime
    }
    return config
  },

  /**
   * Fetch the config for a particular pupil for a test
   * @param {Object} pupil - plain pupil object
   * @return {Promise.<{questionTime: *, loadingTime: *, checkTime: *, speechSynthesis: boolean}>}
   */
  getConfig: async function getConfig (pupil) {
    const config = await this.getQuestionSettings()

    // specific config for a pupil
    const checkOptions = {
      speechSynthesis: !!pupil.speechSynthesis,
      audibleSounds: false,
      inputAssistance: false,
      numpadRemoval: false,
      fontSize: false,
      colourContrast: false,
      questionReader: false,
      nextBetweenQuestions: false
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
      logger.error('Failed to get access arrangements: ' + error.message)
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
      if (code === accessArrangementsDataService.CODES.NEXT_BETWEEN_QUESTIONS) checkOptions.nextBetweenQuestions = true
    })

    return R.mergeRight(config, checkOptions)
  },

  getBaseConfig: function getBaseConfig () {
    return  {
      audibleSounds: false,
      checkTime: undefined,
      colourContrast: false,
      colourContrastCode: undefined,
      fontSize: false,
      inputAssistance: false,
      loadingTime: undefined,
      nextBetweenQuestions: false,
      numpadRemoval: false,
      questionReader: false,
      questionTime: undefined,
      speechSynthesis: false
    }
  },

  /**
   *
   * @param {string} commaSeparatedString
   * @return {Array}
   */
  split: function split (commaSeparatedString) {
    if (!commaSeparatedString) {
      return []
    }
    return R.split(',', commaSeparatedString)
  },

  /**
   * Generate the pupil config for a single pupil
   * @param {pupilId, schoolId, loadingTime, questionTime, checkTime, speechSynthesis, accessArrangementCodes, fontSizeCode, colourContrastCode} singlePupilConfigData
   * @return {*|{numpadRemoval, audibleSounds, checkTime, colourContrastCode, inputAssistance, loadingTime, questionReader, colourContrast, fontSize, speechSynthesis, questionTime, nextBetweenQuestions}}
   */
  generateConfig: function generateConfig (singlePupilConfigData) {
    const config = this.getBaseConfig()

    config.loadingTime = singlePupilConfigData.loadingTime
    config.questionTime = singlePupilConfigData.questionTime
    config.checkTime = singlePupilConfigData.checkTime
    config.speechSynthesis = singlePupilConfigData.speechSynthesis
    const accessArrangementCodes = this.split(singlePupilConfigData.accessArrangementCodes)

    accessArrangementCodes.forEach(code => {
      switch (code) {
        case accessArrangementsDataService.CODES.AUDIBLE_SOUNDS:
          config.audibleSounds = true
          break
        case accessArrangementsDataService.CODES.COLOUR_CONTRAST:
          config.colourContrast = true
          config.colourContrastCode = singlePupilConfigData.colourContrastCode
          break
        case accessArrangementsDataService.CODES.FONT_SIZE:
          config.fontSize = true
          config.fontSizeCode = singlePupilConfigData.fontSizeCode
          break
        case accessArrangementsDataService.CODES.INPUT_ASSISTANCE:
          config.inputAssistance = true
          break
        case accessArrangementsDataService.CODES.NEXT_BETWEEN_QUESTIONS:
          config.nextBetweenQuestions = true
          break
        case accessArrangementsDataService.CODES.QUESTION_READER:
          config.questionReader = true
          break
        case accessArrangementsDataService.CODES.NUMPAD_REMOVAL:
          config.numpadRemoval = true
          break
        default:
          logger.error(`ERROR: Unknown config option ${code} for pupil ${singlePupilConfigData.pupilId}`)
          break
      }
    })

    return config
  },

  /**
   * Generate a config object for a batch of pupils
   * @param configDataByPupil
   * @param questionTimings
   *
   */
  generateAllConfigs: function generateConfig (configData) {
    const configsByPupil = {}
    configData.forEach(singlePupilConfigData => {
      configsByPupil[ singlePupilConfigData.pupilId ] = this.generateConfig(singlePupilConfigData)
    })
    return configsByPupil
  },

  getBatchConfig: async function getBatchConfig (pupilIds, schoolId) {
    let configsByPupil

    try {
      const configData = await configDataService.getBatchConfig(pupilIds, schoolId)
      configsByPupil = this.generateAllConfigs(configData)
    } catch (error) {
      logger.error('Failed to get batch pupil configs', error)
      throw error
    }

    return configsByPupil
  },
}

module.exports = configService
