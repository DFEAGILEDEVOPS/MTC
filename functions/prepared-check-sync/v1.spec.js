'use strict'

/* global describe, expect, it, spyOn, beforeEach, beforeAll, fail */

const azureStorageHelper = require('../lib/azure-storage-helper')
const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()
const context = require('../mock-context')

const aaConfig = {
  audibleSounds: false,
  inputAssistance: false,
  numpadRemoval: false,
  fontSize: false,
  colourContrast: false,
  questionReader: false,
  nextBetweenQuestions: false
}

const checkConfig = {
  questionTime: 5,
  loadingTime: 5,
  speechSynthesis: false,
  ...aaConfig
}

describe('prepared-check-sync: v1', () => {
  let checkDataService, v1, accessArrangementsSqlUtil

  beforeAll(() => {
    // sql-helper connects to the database as a side-effect of requiring it.
    checkDataService = require('./check.data.service')
    v1 = require('./v1')
    accessArrangementsSqlUtil = require('./access-arrangements-sql-util')
  })

  describe('process', () => {
    it('fetches all active checkCodes for a pupil and updates each preparedCheck', async () => {
      const message = { checkCode: 'abc-def-123', version: 1 }
      spyOn(checkDataService, 'sqlFindActiveCheckCodesByCheckCode').and.returnValue({ livePupilCheckCode: 'abc-def-123', tryOutPupilCheckCode: 'abc-def-234' })
      spyOn(v1, 'updatePreparedChecks')
      await v1.process(context, message)
      expect(checkDataService.sqlFindActiveCheckCodesByCheckCode).toHaveBeenCalled()
      expect(v1.updatePreparedChecks).toHaveBeenCalledTimes(2)
    })
  })
  describe('updatePreparedChecks', () => {
    const checkCode = 'abc-def-123'
    describe('when async methods do not throw errors', () => {
      beforeEach(() => {
        spyOn(azureStorageHelper, 'getFromPreparedCheckTableStorage').and.returnValue({
          PartitionKey: 'key1',
          RowKey: 'key2',
          config: {}
        })
        spyOn(accessArrangementsSqlUtil, 'sqlFindPupilAccessArrangementsByCheckCode')
        spyOn(v1, 'getUpdatedConfig').and.returnValue(checkConfig)
        spyOn(azureTableService, 'insertOrMergeEntityAsync')
      })

      it('makes a call to get prepared check from table storage', async () => {
        await v1.updatePreparedChecks(context, checkCode)
        expect(azureStorageHelper.getFromPreparedCheckTableStorage).toHaveBeenCalled()
      })

      it('makes a call to get pupil access arrangements', async () => {
        await v1.updatePreparedChecks(context, checkCode)
        expect(accessArrangementsSqlUtil.sqlFindPupilAccessArrangementsByCheckCode).toHaveBeenCalled()
      })

      it('makes a call to get the updated config', async () => {
        await v1.updatePreparedChecks(context, checkCode)
        expect(v1.getUpdatedConfig).toHaveBeenCalled()
      })

      it('makes a call to merge the new props into the table storage entity', async () => {
        await v1.updatePreparedChecks(context, checkCode)
        expect(azureTableService.insertOrMergeEntityAsync).toHaveBeenCalled()
      })
    })
    describe('when async methods do throw errors', () => {
      it('throws an error if getFromPreparedCheckTableStorage method throws an error', async () => {
        spyOn(azureStorageHelper, 'getFromPreparedCheckTableStorage').and.returnValue(Promise.reject(new Error('error')))
        spyOn(accessArrangementsSqlUtil, 'sqlFindPupilAccessArrangementsByCheckCode')
        spyOn(v1, 'getUpdatedConfig').and.returnValue(checkConfig)
        spyOn(azureTableService, 'insertOrMergeEntityAsync')
        try {
          await v1.updatePreparedChecks(context, checkCode)
          fail()
        } catch (error) {
          expect(error.message).toBe('error')
        }
        expect(azureStorageHelper.getFromPreparedCheckTableStorage).toHaveBeenCalled()
        expect(accessArrangementsSqlUtil.sqlFindPupilAccessArrangementsByCheckCode).not.toHaveBeenCalled()
        expect(v1.getUpdatedConfig).not.toHaveBeenCalled()
        expect(azureTableService.insertOrMergeEntityAsync).not.toHaveBeenCalled()
      })
      it('throws an error if sqlFindPupilAccessArrangementsByCheckCode method throws an error', async () => {
        spyOn(azureStorageHelper, 'getFromPreparedCheckTableStorage').and.returnValue({
          PartitionKey: 'key1',
          RowKey: 'key2',
          config: {}
        })
        spyOn(accessArrangementsSqlUtil, 'sqlFindPupilAccessArrangementsByCheckCode').and.returnValue(Promise.reject(new Error('error')))
        spyOn(v1, 'getUpdatedConfig').and.returnValue(checkConfig)
        spyOn(azureTableService, 'insertOrMergeEntityAsync')
        try {
          await v1.updatePreparedChecks(context, checkCode)
          fail()
        } catch (error) {
          expect(error.message).toBe('error')
        }
        expect(azureStorageHelper.getFromPreparedCheckTableStorage).toHaveBeenCalled()
        expect(accessArrangementsSqlUtil.sqlFindPupilAccessArrangementsByCheckCode).toHaveBeenCalled()
        expect(v1.getUpdatedConfig).not.toHaveBeenCalled()
        expect(azureTableService.insertOrMergeEntityAsync).not.toHaveBeenCalled()
      })
      it('throws an error if sqlFindPupilAccessArrangementsByCheckCode method throws an error', async () => {
        spyOn(azureStorageHelper, 'getFromPreparedCheckTableStorage').and.returnValue({
          PartitionKey: 'key1',
          RowKey: 'key2',
          config: {}
        })
        spyOn(accessArrangementsSqlUtil, 'sqlFindPupilAccessArrangementsByCheckCode')
        spyOn(v1, 'getUpdatedConfig').and.returnValue(checkConfig).and.returnValue(Promise.reject(new Error('error')))
        spyOn(azureTableService, 'insertOrMergeEntityAsync')
        try {
          await v1.updatePreparedChecks(context, checkCode)
          fail()
        } catch (error) {
          expect(error.message).toBe('error')
        }
        expect(azureStorageHelper.getFromPreparedCheckTableStorage).toHaveBeenCalled()
        expect(accessArrangementsSqlUtil.sqlFindPupilAccessArrangementsByCheckCode).toHaveBeenCalled()
        expect(v1.getUpdatedConfig).toHaveBeenCalled()
        expect(azureTableService.insertOrMergeEntityAsync).not.toHaveBeenCalled()
      })
      it('throws an error if sqlFindPupilAccessArrangementsByCheckCode method throws an error', async () => {
        spyOn(azureStorageHelper, 'getFromPreparedCheckTableStorage').and.returnValue({
          PartitionKey: 'key1',
          RowKey: 'key2',
          config: {}
        })
        spyOn(accessArrangementsSqlUtil, 'sqlFindPupilAccessArrangementsByCheckCode')
        spyOn(v1, 'getUpdatedConfig').and.returnValue(checkConfig)
        spyOn(azureTableService, 'insertOrMergeEntityAsync').and.returnValue(Promise.reject(new Error('error')))
        try {
          await v1.updatePreparedChecks(context, checkCode)
          fail()
        } catch (error) {
          expect(error.message).toBe('error')
        }
        expect(azureStorageHelper.getFromPreparedCheckTableStorage).toHaveBeenCalled()
        expect(accessArrangementsSqlUtil.sqlFindPupilAccessArrangementsByCheckCode).toHaveBeenCalled()
        expect(v1.getUpdatedConfig).toHaveBeenCalled()
        expect(azureTableService.insertOrMergeEntityAsync).toHaveBeenCalled()
      })
    })
  })

  describe('getUpdatedConfig', () => {
    let preparedCheckConfig
    let pupilAccessArrangements
    beforeEach(() => {
      preparedCheckConfig = JSON.stringify(checkConfig)
      pupilAccessArrangements = [
        {
          accessArrangements_id: 3,
          pupilFontSizeCode: 'RGL',
          pupilColourContrastCode: null
        },
        {
          accessArrangements_id: 4,
          pupilFontSizeCode: null,
          pupilColourContrastCode: 'BOW'
        }
      ]
    })
    it('creates a new config based on the new aa settings and the config supplied', async () => {
      spyOn(accessArrangementsSqlUtil, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue(['FTS', 'CCT'])
      const config = await v1.getUpdatedConfig(preparedCheckConfig, pupilAccessArrangements, context)
      expect(accessArrangementsSqlUtil.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.fontSize).toBeTruthy()
      expect(config.fontSizeCode).toBe('RGL')
      expect(config.colourContrast).toBeTruthy()
      expect(config.colourContrastCode).toBe('BOW')
    })
  })
  it('throws an error if sqlFindAccessArrangementsCodesWithIds method throws an error', async () => {
    spyOn(accessArrangementsSqlUtil, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue(Promise.reject(new Error('error')))
    const preparedCheckConfig = JSON.stringify(checkConfig)
    const pupilAccessArrangements = [
      {
        accessArrangements_id: 3,
        pupilFontSizeCode: 'RGL',
        pupilColourContrastCode: null
      },
      {
        accessArrangements_id: 4,
        pupilFontSizeCode: null,
        pupilColourContrastCode: 'BOW'
      }
    ]
    try {
      await v1.getUpdatedConfig(preparedCheckConfig, pupilAccessArrangements, context)
      fail()
    } catch (error) {
      expect(error.message).toBe('error')
    }
  })
})
