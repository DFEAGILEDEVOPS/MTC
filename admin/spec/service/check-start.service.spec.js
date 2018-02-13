'use strict'

/* global describe it expect beforeEach spyOn fail */

const moment = require('moment')
const winston = require('winston')

const checkDataService = require('../../services/data-access/check.data.service')
const checkFormDataService = require('../../services/data-access/check-form.data.service')
const checkFormService = require('../../services/check-form.service')
const checkStartService = require('../../services/check-start.service')
const checkWindowDataService = require('../../services/data-access/check-window.data.service')
const pinGenerationService = require('../../services/pin-generation.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')

const checkWindowMock = require('../mocks/check-window-2')
const checkFormMock = {
  id: 100,
  name: 'MTC0100',
  isDeleted: false,
  formData: '[ { "f1" : 2, "f2" : 5},{"f1" : 11,"f2" : 2    }]'
}
const preparedCheckMock = {
  id: 1,
  checkCode: 'abc-def-ghi',
  checkWindow_id: 2,
  checkForm_id: 3,
  pupil_id: 42,
  pupilLoginDate: null,
  mark: null,
  maxMark: null,
  markedAt: null,
  startedAt: null,
  data: null
}

describe('check-start.service', () => {
  const service = checkStartService
  const dfeNumber = 9991999

  describe('#prepareCheck', () => {
    const mockPupils = [
      {id: 1},
      {id: 2},
      {id: 3}
    ]
    const pupilIds = ['1', '2', '3'] // strings to mimic incoming form params
    const pupilIdsHackAttempt = ['1', '2', '3', '4']

    beforeEach(() => {
      spyOn(checkWindowDataService, 'sqlFindOneCurrent').and.returnValue(Promise.resolve(checkWindowMock))
      spyOn(pinGenerationService, 'updatePupilPins')
      spyOn(checkStartService, 'initialisePupilCheck')
      spyOn(checkDataService, 'sqlCreateBatch')
      spyOn(checkFormService, 'getAllFormsForCheckWindow').and.returnValue(Promise.resolve([]))
      spyOn(checkDataService, 'sqlFindAllFormsUsedByPupils').and.returnValue(Promise.resolve([]))
    })

    describe('pupil validation', () => {
      beforeEach(() => {
        spyOn(pupilDataService, 'sqlFindByIdAndDfeNumber').and.returnValue(Promise.resolve(mockPupils))
      })

      it('throws an error if dfeNumber is not provided', async () => {
        try {
          await service.prepareCheck(pupilIds)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('dfeNumber is required')
        }
      })

      it('finds the current check window', async () => {
        await service.prepareCheck(pupilIds, dfeNumber)
        expect(checkWindowDataService.sqlFindOneCurrent).toHaveBeenCalledTimes(1)
      })

      it('calls initialiseCheck once per pupil', async () => {
        await service.prepareCheck(pupilIds, dfeNumber)
        expect(checkStartService.initialisePupilCheck).toHaveBeenCalledTimes(3)
      })

      it('calls sqlCreateBatch to save the checks', async () => {
        await service.prepareCheck(pupilIds, dfeNumber)
        expect(checkDataService.sqlCreateBatch).toHaveBeenCalledTimes(1)
        const arg = checkDataService.sqlCreateBatch.calls.mostRecent().args[0]
        expect(arg.length).toBe(3)
      })
    })

    describe('pupil validation fails', () => {
      beforeEach(() => {
        spyOn(pupilDataService, 'sqlFindByIdAndDfeNumber').and.returnValue(Promise.resolve(mockPupils))
      })
      it('validates the pupils against the database', async () => {
        // This validation emits a winston.warn() as potentially it is serious, so let's
        // shut it up for the test
        spyOn(winston, 'warn')
        try {
          await service.prepareCheck(pupilIdsHackAttempt, dfeNumber)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('Validation failed')
        }
      })
    })
  })

  describe('#initialisePupilCheck', () => {
    it('calls allocateCheckForm for a pupil', async () => {
      spyOn(checkFormService, 'allocateCheckForm').and.returnValue(checkFormMock)
      await service.initialisePupilCheck(1, checkWindowMock)
      expect(checkFormService.allocateCheckForm).toHaveBeenCalledTimes(1)
    })

    it('throws an error if a checkform is not returned', async () => {
      spyOn(checkFormService, 'allocateCheckForm').and.returnValue(null)
      try {
        await service.initialisePupilCheck(1, checkWindowMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('CheckForm not allocated')
      }
    })

    it('returns a check object, ready to be inserted into the db', async () => {
      spyOn(checkFormService, 'allocateCheckForm').and.returnValue(checkFormMock)
      const c = await service.initialisePupilCheck(1, checkWindowMock)
      expect(c.hasOwnProperty('pupil_id'))
      expect(c.hasOwnProperty('checkWindow_id'))
      expect(c.hasOwnProperty('checkForm_id'))
    })
  })

  describe('#pupilLogin', () => {
    it('finds the latest check for the pupil', async () => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(preparedCheckMock)
      spyOn(checkFormDataService, 'sqlGetActiveForm').and.returnValue([checkFormMock])
      spyOn(checkDataService, 'sqlUpdate')
      await service.pupilLogin(1)
      expect(checkDataService.sqlFindOneForPupilLogin).toHaveBeenCalled()
    })

    it('throws an error if the check is not found', async () => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(null)
      spyOn(checkFormDataService, 'sqlGetActiveForm').and.returnValue([checkFormMock])
      spyOn(checkDataService, 'sqlUpdate')
      try {
        await service.pupilLogin(1)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Unable to find a prepared check for pupil: 1')
      }
    })

    it('finds the CheckForm for the check', async () => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(preparedCheckMock)
      spyOn(checkFormDataService, 'sqlGetActiveForm').and.returnValue([checkFormMock])
      spyOn(checkDataService, 'sqlUpdate')
      await service.pupilLogin(1)
      expect(checkFormDataService.sqlGetActiveForm).toHaveBeenCalled()
    })

    it('throws an error if the check form is not found', async () => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(preparedCheckMock)
      spyOn(checkFormDataService, 'sqlGetActiveForm').and.returnValue(null)
      spyOn(checkDataService, 'sqlUpdate')
      try {
        await service.pupilLogin(1)
      } catch (error) {
        expect(error.message).toBe('CheckForm not found: 3')
      }
    })

    it('calls sqlUpdate to add the pupilLoginDate to the check', async () => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(preparedCheckMock)
      spyOn(checkFormDataService, 'sqlGetActiveForm').and.returnValue([checkFormMock])
      spyOn(checkDataService, 'sqlUpdate')
      await service.pupilLogin(1)
      expect(checkDataService.sqlUpdate).toHaveBeenCalled()
      const arg = checkDataService.sqlUpdate.calls.mostRecent().args[0]
      expect(arg.hasOwnProperty('pupilLoginDate')).toBeTruthy()
      expect(moment.isMoment(arg.pupilLoginDate)).toBeTruthy()
    })

    it('returns an object with checkCode and questions props', async () => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(preparedCheckMock)
      spyOn(checkFormDataService, 'sqlGetActiveForm').and.returnValue([checkFormMock])
      spyOn(checkDataService, 'sqlUpdate')
      const res = await service.pupilLogin(1)
      expect(res.hasOwnProperty('checkCode')).toBeTruthy()
      expect(res.hasOwnProperty('questions')).toBeTruthy()
    })
  })
})
