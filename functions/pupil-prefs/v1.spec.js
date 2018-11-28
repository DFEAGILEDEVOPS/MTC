'use strict'

/* global describe expect it spyOn beforeEach fail */

'use strict'

const moment = require('moment')
const sqlService = require('less-tedious')
const { TYPES } = require('tedious')
const uuid = require('uuid/v4')
const winston = require('winston')

const accessArrangementsTable = '[accessArrangements]'
const azureStorageHelper = require('../lib/azure-storage-helper')
const config = require('../config')
const checkTable = '[check]'
const pupilAccessArrangementsTable = '[pupilAccessArrangements]'
const pupilFontSizesTable = '[pupilFontSizes]'
const pupilColourContrastsTable = '[pupilColourContrasts]'
const pupilTable = '[pupil]'
const schema = '[mtc_admin]'
const context = require('../mock-context')
const v1 = require('./v1')

describe('pupil-prefs: v1', () => {
  describe('process', () => {
    describe('when async methods do not throw errors', () => {
      it('calls updates pupil preferences and submits to prepared check sync queue', async () => {
        spyOn(v1, 'updatePupilAccessArrangementsPreference')
        spyOn(azureStorageHelper, 'addMessageToQueue')
        const message = {
          checkCode: 'abc-def-123',
          preferences: {
            fontSizeCode: 'RGL',
            colourContrastCode: null
          },
          version: 1
        }
        try {
          await v1.process(context, message)
        } catch (error) {
          fail()
        }
        expect(v1.updatePupilAccessArrangementsPreference).toHaveBeenCalledTimes(1)
        expect(azureStorageHelper.addMessageToQueue).toHaveBeenCalled()
      })
    })
    describe('when async methods do throw errors', () => {
      it('throws an error if updatePupilAccessArrangementsPreference method throws an error', async () => {
        spyOn(v1, 'updatePupilAccessArrangementsPreference').and.returnValue(Promise.reject(new Error('error')))
        spyOn(azureStorageHelper, 'addMessageToQueue')
        const message = {
          checkCode: 'abc-def-123',
          preferences: {
            fontSizeCode: 'RGL',
            colourContrastCode: null
          },
          version: 1
        }
        try {
          await v1.process(context, message)
          fail()
        } catch (error) {
          expect(error.message).toBe('error')
        }
        expect(v1.updatePupilAccessArrangementsPreference).toHaveBeenCalled()
        expect(azureStorageHelper.addMessageToQueue).not.toHaveBeenCalled()
      })
      it('throws an error if addMessageToQueue method throws an error', async () => {
        spyOn(v1, 'updatePupilAccessArrangementsPreference')
        spyOn(azureStorageHelper, 'addMessageToQueue').and.returnValue(Promise.reject(new Error('error')))
        const message = {
          checkCode: 'abc-def-123',
          preferences: {
            fontSizeCode: 'RGL',
            colourContrastCode: null
          },
          version: 1
        }
        try {
          await v1.process(context, message)
          fail()
        } catch (error) {
          expect(error.message).toBe('error')
        }
        expect(v1.updatePupilAccessArrangementsPreference).toHaveBeenCalled()
        expect(azureStorageHelper.addMessageToQueue).toHaveBeenCalled()
      })
    })
  })
})
