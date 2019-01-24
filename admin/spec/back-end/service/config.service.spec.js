'use strict'
/* global describe it expect beforeEach spyOn */
const R = require('ramda')

const settingDataService = require('../../../services/data-access/setting.data.service')
const configService = require('../../../services/config.service')
const configDataService = require('../../../services/data-access/config.data.service')
const accessArrangementsDataService = require('../../../services/data-access/access-arrangements.data.service')
const pupilAccessArrangementsDataService = require('../../../services/data-access/pupil-access-arrangements.data.service')
const pupilMock = require('../mocks/pupil')
const logger = require('../../../services/log.service').getLogger()

describe('config service', () => {
  describe('database config table values exist', () => {
    beforeEach(() => {
      spyOn(settingDataService, 'sqlFindOne').and.returnValue({
        loadingTimeLimit: 20,
        questionTimeLimit: 50,
        checkTimeLimit: 90
      })
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue({})
    })

    it('returns timings from the config table when group values are missing', async () => {
      const config = await configService.getConfig(pupilMock)
      expect(config.loadingTime).toBe(20)
      expect(config.questionTime).toBe(50)
      expect(config.checkTime).toBe(90)
    })

    it('adds the pupil checkOptions into the returned config', async () => {
      const config = await configService.getConfig(pupilMock)
      expect(config.speechSynthesis).toBeDefined()
    })
  })

  describe('access arrangements', () => {
    beforeEach(() => {
      spyOn(settingDataService, 'sqlFindOne').and.returnValue({
        loadingTimeLimit: 20,
        questionTimeLimit: 50,
        checkTimeLimit: 90
      })
    })
    it('it sets audible sounds to true if ATA is flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.AUDIBLE_SOUNDS
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.audibleSounds).toBe(true)
    })

    it('it sets numpad removal to true if RON is flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.NUMPAD_REMOVAL
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.numpadRemoval).toBe(true)
    })

    it('it sets font size to true if FNT is flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.FONT_SIZE
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.fontSize).toBe(true)
    })

    it('it sets colour contrast to true if CCT is flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.COLOUR_CONTRAST
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.colourContrast).toBe(true)
    })
    it('it sets input assistance to true if ITA is flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.INPUT_ASSISTANCE
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.inputAssistance).toBe(true)
    })

    it('it sets question reader to true if QNR is flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.QUESTION_READER
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.questionReader).toBe(true)
    })

    it('it sets next between questions to true if NBQ is flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.NEXT_BETWEEN_QUESTIONS
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.nextBetweenQuestions).toBe(true)
    })

    it('it sets all access arrangements to false if not flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue(['---'])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.audibleSounds).toBe(false)
      expect(config.numpadRemoval).toBe(false)
    })

    it('it sets all access arrangements flags to false if pupil has no access arrangements', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds')
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).not.toHaveBeenCalled()
      expect(config.audibleSounds).toBe(false)
      expect(config.numpadRemoval).toBe(false)
    })
    it('it sets pupil font size selection in the config based on the received value from the database', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.FONT_SIZE
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1, pupilFontSizeCode: 'LRG' }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.fontSizeCode).toBe('LRG')
    })
    it('it sets colour contrast selection in the config based on the received value from the database', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.COLOUR_CONTRAST
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1, pupilColourContrastCode: 'BOW' }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.colourContrastCode).toBe('BOW')
    })
  })

  describe('database values do not exist', () => {
    it('returns timings from the config file', async () => {
      spyOn(settingDataService, 'sqlFindOne')
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue({})
      const config = await configService.getConfig(pupilMock)
      expect(config.loadingTime).toBe(3)
      expect(config.questionTime).toBe(6)
      expect(config.checkTime).toBe(30)
    })
  })

  describe('batch config', () => {
    it('returns a base config when no AA are set', async () => {
      const pupilId = 5
      spyOn(configDataService, 'getBatchConfig').and.returnValue(
        [{
          pupilId: pupilId,
          schoolId: 18601,
          loadingTime: 1,
          questionTime: 2,
          checkTime: 32,
          speechSynthesis: false,
          accessArrangementCodes: '',
          fontSizeCode: null,
          colourContrastCode: null
        }])
      const c = await configService.getBatchConfig([5], 18601)
      const config = c[pupilId]
      expect(config.audibleSounds).toBeFalsy()
      expect(config.checkTime).toBe(32)
      expect(config.colourContrast).toBeFalsy()
      expect(config.fontSize).toBeFalsy()
      expect(config.inputAssistance).toBeFalsy()
      expect(config.loadingTime).toBe(1)
      expect(config.nextBetweenQuestions).toBeFalsy()
      expect(config.numpadRemoval).toBeFalsy()
      expect(config.questionReader).toBeFalsy()
      expect(config.questionTime).toBe(2)
      expect(config.speechSynthesis).toBeFalsy()
    })

    it('sets speechSynthesis correctly', async () => {
      const pupilId = 5
      spyOn(configDataService, 'getBatchConfig').and.returnValue(
        [{
          pupilId: pupilId,
          schoolId: 18601,
          loadingTime: 1,
          questionTime: 2,
          checkTime: 32,
          speechSynthesis: true,
          accessArrangementCodes: '',
          fontSizeCode: null,
          colourContrastCode: null
        }])
      const c = await configService.getBatchConfig([5], 18601)
      const config = c[pupilId]
      expect(config.speechSynthesis).toBe(true)
    })

    it('set audible sounds correctly', async () => {
      const pupilId = 5
      spyOn(configDataService, 'getBatchConfig').and.returnValue(
        [{
          pupilId: pupilId,
          schoolId: 18601,
          loadingTime: 1,
          questionTime: 2,
          checkTime: 32,
          speechSynthesis: false,
          accessArrangementCodes: 'ATA',
          fontSizeCode: null,
          colourContrastCode: null
        }])
      const c = await configService.getBatchConfig([5], 18601)
      const config = c[pupilId]
      expect(config.audibleSounds).toBe(true)
    })

    it('set input assistance correctly', async () => {
      const pupilId = 5
      spyOn(configDataService, 'getBatchConfig').and.returnValue(
        [{
          pupilId: pupilId,
          schoolId: 18601,
          loadingTime: 1,
          questionTime: 2,
          checkTime: 32,
          speechSynthesis: false,
          accessArrangementCodes: 'ITA',
          fontSizeCode: null,
          colourContrastCode: null
        }])
      const c = await configService.getBatchConfig([5], 18601)
      const config = c[pupilId]
      expect(config.inputAssistance).toBe(true)
    })

    it('set colour contrast correctly without a colour contrast code already set', async () => {
      const pupilId = 5
      spyOn(configDataService, 'getBatchConfig').and.returnValue(
        [{
          pupilId: pupilId,
          schoolId: 18601,
          loadingTime: 1,
          questionTime: 2,
          checkTime: 32,
          speechSynthesis: false,
          accessArrangementCodes: 'CCT',
          fontSizeCode: null,
          colourContrastCode: null
        }])
      const c = await configService.getBatchConfig([5], 18601)
      const config = c[pupilId]
      expect(config.colourContrast).toBe(true)
      expect(config.colourContrastCode).toBeFalsy()
    })

    it('sets the font size correctly without a font size code already set', async () => {
      const pupilId = 5
      spyOn(configDataService, 'getBatchConfig').and.returnValue(
        [{
          pupilId: pupilId,
          schoolId: 18601,
          loadingTime: 1,
          questionTime: 2,
          checkTime: 32,
          speechSynthesis: false,
          accessArrangementCodes: 'FTS',
          fontSizeCode: null,
          colourContrastCode: null
        }])
      const c = await configService.getBatchConfig([5], 18601)
      const config = c[pupilId]
      expect(config.fontSize).toBe(true)
      expect(config.fontSizeCode).toBeFalsy()
    })

    it('sets the font size correctly with a font size code already set', async () => {
      const pupilId = 5
      spyOn(configDataService, 'getBatchConfig').and.returnValue(
        [{
          pupilId: pupilId,
          schoolId: 18601,
          loadingTime: 1,
          questionTime: 2,
          checkTime: 32,
          speechSynthesis: false,
          accessArrangementCodes: 'FTS',
          fontSizeCode: 'XLG',
          colourContrastCode: null
        }])
      const c = await configService.getBatchConfig([5], 18601)
      const config = c[pupilId]
      expect(config.fontSize).toBe(true)
      expect(config.fontSizeCode).toBe('XLG')
    })

    it('sets the next-between-questions flag correctly', async () => {
      const pupilId = 5
      spyOn(configDataService, 'getBatchConfig').and.returnValue(
        [{
          pupilId: pupilId,
          schoolId: 18601,
          loadingTime: 1,
          questionTime: 2,
          checkTime: 32,
          speechSynthesis: false,
          accessArrangementCodes: 'NBQ',
          fontSizeCode: null,
          colourContrastCode: null
        }])
      const c = await configService.getBatchConfig([5], 18601)
      const config = c[pupilId]
      expect(config.nextBetweenQuestions).toBe(true)
    })

    it('sets the question reader flag correctly', async () => {
      const pupilId = 5
      spyOn(configDataService, 'getBatchConfig').and.returnValue(
        [{
          pupilId: pupilId,
          schoolId: 18601,
          loadingTime: 1,
          questionTime: 2,
          checkTime: 32,
          speechSynthesis: false,
          accessArrangementCodes: 'QNR',
          fontSizeCode: null,
          colourContrastCode: null
        }])
      const c = await configService.getBatchConfig([5], 18601)
      const config = c[pupilId]
      expect(config.questionReader).toBe(true)
    })

    it('sets the numpad removal flag correctly', async () => {
      const pupilId = 5
      spyOn(configDataService, 'getBatchConfig').and.returnValue(
        [{
          pupilId: pupilId,
          schoolId: 18601,
          loadingTime: 1,
          questionTime: 2,
          checkTime: 32,
          speechSynthesis: false,
          accessArrangementCodes: 'RON',
          fontSizeCode: null,
          colourContrastCode: null
        }])
      const c = await configService.getBatchConfig([5], 18601)
      const config = c[pupilId]
      expect(config.numpadRemoval).toBe(true)
    })

    it('logs any unknown access arrangement code', async () => {
      const pupilId = 5
      spyOn(logger, 'error')
      spyOn(configDataService, 'getBatchConfig').and.returnValue(
        [{
          pupilId: pupilId,
          schoolId: 18601,
          loadingTime: 1,
          questionTime: 2,
          checkTime: 32,
          speechSynthesis: false,
          accessArrangementCodes: 'INVALID_CODE',
          fontSizeCode: null,
          colourContrastCode: null
        }])
      await configService.getBatchConfig([5], 18601)
      expect(logger.error).toHaveBeenCalledTimes(1)
    })

    it('can set multiple access codes', async () => {
      const pupilId = 5
      spyOn(configDataService, 'getBatchConfig').and.returnValue(
        [{
          pupilId: pupilId,
          schoolId: 18601,
          loadingTime: 5,
          questionTime: 7,
          checkTime: 64,
          speechSynthesis: true,
          accessArrangementCodes: 'ATA,CCT,FTS,ITA,NBQ,QNR,RON',
          fontSizeCode: 'VSM',
          colourContrastCode: 'YOB'
        }])
      const c = await configService.getBatchConfig([5], 18601)
      const config = c[pupilId]
      expect(config.audibleSounds).toBe(true)
      expect(config.checkTime).toBe(64)
      expect(config.colourContrast).toBe(true)
      expect(config.colourContrastCode).toBe('YOB')
      expect(config.fontSize).toBe(true)
      expect(config.fontSizeCode).toBe('VSM')
      expect(config.inputAssistance).toBe(true)
      expect(config.loadingTime).toBe(5)
      expect(config.nextBetweenQuestions).toBe(true)
      expect(config.numpadRemoval).toBe(true)
      expect(config.questionReader).toBe(true)
      expect(config.questionTime).toBe(7)
      expect(config.speechSynthesis).toBe(true)
    })
  })

  describe('#validateConfigDate', () => {
    const mockData = [ { pupilId: 5,
      schoolId: 18601,
      loadingTime: 1,
      questionTime: 2,
      checkTime: 32,
      speechSynthesis: false,
      accessArrangementCodes: 'CCT',
      fontSizeCode: null,
      colourContrastCode: null } ]
    it('throws if passed null', () => {
      expect(function() { configService.validateConfigData(null) } ).toThrowError('Pupil config data is not valid')
    })
    it('throws if passed undefined', () => {
      expect(function() { configService.validateConfigData(undefined) } ).toThrowError('Pupil config data is not valid')
    })
    it('throws if passed {}', () => {
      expect(function() { configService.validateConfigData({}) } ).toThrowError('Pupil config data is not valid')
    })
    it('throws if passed an empty array', () => {
      expect(function() { configService.validateConfigData([]) } ).toThrowError(/^Missing settings:/)
    })
    it('throws if passed a 0 second questionTime', () => {
      const testData = R.map(R.assoc('questionTime', 0), mockData)
      expect(function() { configService.validateConfigData(testData) } ).toThrowError('questionTime is required to be set in the database')
    })
    it('throws if passed a 0 second loadingTime', () => {
      const testData = R.map(R.assoc('loadingTime', 0), mockData)
      expect(function() { configService.validateConfigData(testData) } ).toThrowError('loadingTime is required to be set in the database')
    })
    it('throws if passed a 0 second checkTime', () => {
      const testData = R.map(R.assoc('checkTime', 0), mockData)
      expect(function() { configService.validateConfigData(testData) } ).toThrowError('checkTime is required to be set in the database')
    })
  })
})
