'use strict'

/* global describe, expect, it, spyOn, fail, beforeAll */

const azureStorageHelper = require('../lib/azure-storage-helper')
const context = require('../mock-context')

describe('pupil-prefs: v1', () => {
  let v1

  beforeAll(() => {
    v1 = require('./v1')
  })

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
