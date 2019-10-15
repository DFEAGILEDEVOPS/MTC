'use strict'

const R = require('ramda')
const logger = require('./log.service').getLogger()

const accessArrangementsDataService = require('./data-access/access-arrangements.data.service')
const configDataService = require('./data-access/config.data.service')

/** @namespace */

const configService = {
  getBaseConfig: function getBaseConfig () {
    return {
      audibleSounds: false,
      checkTime: undefined,
      colourContrast: false,
      colourContrastCode: undefined,
      fontSize: false,
      fontSizeCode: undefined,
      inputAssistance: false,
      loadingTime: undefined,
      nextBetweenQuestions: false,
      numpadRemoval: false,
      practice: true,
      questionReader: false,
      questionTime: undefined
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
   * @param {pupilId, schoolId, loadingTime, questionTime, checkTime, accessArrangementCodes, fontSizeCode, colourContrastCode} singlePupilConfigData
   * @return {*|{numpadRemoval, audibleSounds, checkTime, colourContrastCode, inputAssistance, loadingTime, questionReader, colourContrast, fontSize, questionTime, nextBetweenQuestions}}
   */
  generateConfig: function generateConfig (singlePupilConfigData) {
    const config = this.getBaseConfig()

    config.loadingTime = singlePupilConfigData.loadingTime
    config.questionTime = singlePupilConfigData.questionTime
    config.checkTime = singlePupilConfigData.checkTime
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
   * @param configData
   * @return {object} - properties are the pupil IDs
   *
   */
  generateAllConfigs: function generateConfig (configData) {
    const configsByPupil = {}
    configData.forEach(singlePupilConfigData => {
      configsByPupil[singlePupilConfigData.pupilId] = this.generateConfig(singlePupilConfigData)
    })
    return configsByPupil
  },

  /**
   * Generate pupil configs for multiple pupils
   * @param {number[]} pupilIds
   * @param {number} schoolId
   * @return {Promise<*>}
   */
  getBatchConfig: async function getBatchConfig (pupilIds, schoolId) {
    let configsByPupil

    try {
      const configData = await configDataService.getBatchConfig(pupilIds, schoolId)
      this.validateConfigData(configData)
      configsByPupil = this.generateAllConfigs(configData)
    } catch (error) {
      logger.error('Failed to get batch pupil configs', error)
      throw error
    }

    return configsByPupil
  },

  /**
   * Validate the config data (already retrieved from the DB)
   * @param data
   * @throws
   */
  validateConfigData: function validateConfigData (data) {
    if (!data || !Array.isArray(data)) {
      throw new Error('Pupil config data is not valid')
    }
    if (data.length === 0) {
      throw new Error('Missing settings: questionTime, loadingTime, checkTime.  Please populate the `settings` table.')
    }

    const row = R.head(data)
    // Check that we have defaults for the question settings
    if (!row.questionTime) {
      throw new Error('questionTime is required to be set in the database')
    }
    if (!row.loadingTime) {
      throw new Error('loadingTime is required to be set in the database')
    }
    if (!row.checkTime) {
      throw new Error('checkTime is required to be set in the database')
    }
  }
}

module.exports = configService
