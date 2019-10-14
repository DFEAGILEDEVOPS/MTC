'use strict'
/* global describe it expect spyOn */
const R = require('ramda')

const configService = require('../../../services/config.service')
const configDataService = require('../../../services/data-access/config.data.service')
const logger = require('../../../services/log.service').getLogger()

describe('config service', () => {
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
    })
  })

  describe('#validateConfigDate', () => {
    const mockData = [{
      pupilId: 5,
      schoolId: 18601,
      loadingTime: 1,
      questionTime: 2,
      checkTime: 32,
      accessArrangementCodes: 'CCT',
      fontSizeCode: null,
      colourContrastCode: null
    }]
    it('throws if passed null', () => {
      expect(function () { configService.validateConfigData(null) }).toThrowError('Pupil config data is not valid')
    })
    it('throws if passed undefined', () => {
      expect(function () { configService.validateConfigData(undefined) }).toThrowError('Pupil config data is not valid')
    })
    it('throws if passed {}', () => {
      expect(function () { configService.validateConfigData({}) }).toThrowError('Pupil config data is not valid')
    })
    it('throws if passed an empty array', () => {
      expect(function () { configService.validateConfigData([]) }).toThrowError(/^Missing settings:/)
    })
    it('throws if passed a 0 second questionTime', () => {
      const testData = R.map(R.assoc('questionTime', 0), mockData)
      expect(function () { configService.validateConfigData(testData) }).toThrowError('questionTime is required to be set in the database')
    })
    it('throws if passed a 0 second loadingTime', () => {
      const testData = R.map(R.assoc('loadingTime', 0), mockData)
      expect(function () { configService.validateConfigData(testData) }).toThrowError('loadingTime is required to be set in the database')
    })
    it('throws if passed a 0 second checkTime', () => {
      const testData = R.map(R.assoc('checkTime', 0), mockData)
      expect(function () { configService.validateConfigData(testData) }).toThrowError('checkTime is required to be set in the database')
    })
  })
})
