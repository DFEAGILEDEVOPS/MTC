'use strict'
/* global describe, it, expect, spyOn, fail */

const winston = require('winston')
const checkDataService = require('../../services/data-access/check.data.service')
const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const answerDataService = require('../../services/data-access/answer.data.service')
const checkFormDataService = require('../../services//data-access/check-form.data.service')
const completedCheckMock = require('../mocks/completed-check-with-results')
const checkFormMock = require('../mocks/check-form')

describe('markingService', () => {
  let service = require('../../services/marking.service')

  describe('#mark', () => {
    it('throws an error if the arg is missing', async () => {
      try {
        await service.mark()
        fail('expected to be thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument')
      }
    })

    it('throws an error if the arg is invalid', async () => {
      try {
        await service.mark({data: ''})
        fail('expected to be thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument')
      }
    })

    it('throws an error if the arg is invalid', async () => {
      try {
        await service.mark({data: {answers: null}})
        fail('expected to be thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument')
      }
    })

    it('throws an error if check form is not defined', async () => {
      try {
        await service.mark(completedCheckMock, {})
        fail('expected to be thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument')
      }
    })

    it('throws an error if check form does not have formData', async () => {
      try {
        await service.mark(completedCheckMock, { checkForm: {} })
        fail('expected to be thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument')
      }
    })

    it('marks the answers and sets datetime of marking', async () => {
      spyOn(answerDataService, 'sqlUpdateWithResults')
      spyOn(checkDataService, 'sqlUpdateCheckWithResults').and.callFake((checkCode, marks, maxMarks, processedAt) => {
        expect(marks).toBe(7)
        expect(maxMarks).toBe(10)
        expect(checkCode).toBe('763AD270-278D-4221-886C-23FF7E5E5736')
        expect(processedAt).toBeTruthy()
      })
      await service.mark(completedCheckMock, checkFormMock)
      expect(checkDataService.sqlUpdateCheckWithResults).toHaveBeenCalled()
    })

    it('stores the number of marks applied to each answer in the db', async () => {
      spyOn(checkFormDataService, 'sqlFindOneById').and.returnValue(checkFormMock)
      spyOn(answerDataService, 'sqlUpdateWithResults')
      spyOn(checkDataService, 'sqlUpdateCheckWithResults')
      await service.mark(completedCheckMock, checkFormMock)
      expect(answerDataService.sqlUpdateWithResults).toHaveBeenCalled()
    })
  })

  describe('#batchMark', () => {
    it('throws an error if called without an arg', async (done) => {
      try {
        await service.batchMark()
        fail('expected to be thrown')
      } catch (err) {
        expect(err.message).toBe('Missing arg batchIds')
      }
      done()
    })

    it('throws an error if called with an empty array', async (done) => {
      try {
        await service.batchMark([])
        fail('expected to be thrown')
      } catch (err) {
        expect(err.message).toBe('No documents to mark')
      }
      done()
    })

    it('bulk retrieves the completedChecks', async (done) => {
      spyOn(service, 'mark').and.returnValue(Promise.resolve())
      spyOn(completedCheckDataService, 'sqlFindByIds').and.returnValue([
        {}, {}, {}
      ])
      spyOn(checkFormDataService, 'sqlFindByIds').and.returnValue([
        {}, {}, {}
      ])
      await service.batchMark([1, 2, 3])
      expect(completedCheckDataService.sqlFindByIds).toHaveBeenCalledWith([1, 2, 3])
      done()
    })

    it('ignores errors from mark() and carries on processing', async (done) => {
      spyOn(completedCheckDataService, 'sqlFindByIds').and.returnValue([
        {}, {}, {}
      ])
      spyOn(checkFormDataService, 'sqlFindByIds').and.returnValue([
        {}, {}, {}
      ])
      // As we know this will output a warning lets shut it up during the test
      spyOn(winston, 'error')
      let callCount = 0
      spyOn(service, 'mark').and.callFake((completedCheck) => {
        callCount++
        if (callCount === 2) {
          throw new Error('error')
        }
      })
      await service.batchMark([1, 2, 3])
      expect(service.mark.calls.count()).toBe(3)
      done()
    })
  })

  describe('#applyMarking', () => {
    it('bails out early if the array is empty', async (done) => {
      spyOn(completedCheckDataService, 'sqlFindUnmarked').and.returnValue([])
      spyOn(service, 'batchMark')
      const res = await service.applyMarking(10)
      expect(res).toBeFalsy()
      expect(service.batchMark).not.toHaveBeenCalled()
      done()
    })

    it('it calls the marking service and returns true', async (done) => {
      spyOn(completedCheckDataService, 'sqlFindUnmarked').and.returnValue([1, 2, 3])
      spyOn(service, 'batchMark')
      const res = await service.applyMarking(10)
      expect(service.batchMark).toHaveBeenCalled()
      expect(res).toBeTruthy()
      done()
    })
  })

  describe('#process', () => {
    it('initially find out if there is any work to do', async () => {
      spyOn(completedCheckDataService, 'sqlHasUnmarked').and.returnValue(false)
      spyOn(service, 'applyMarking').and.returnValue(true)
      await service.process()
      expect(completedCheckDataService.sqlHasUnmarked).toHaveBeenCalled()
      expect(service.applyMarking).not.toHaveBeenCalled()
    })

    it('calls applyMarking to handle any work', async () => {
      spyOn(completedCheckDataService, 'sqlHasUnmarked').and.returnValues(true, false)
      spyOn(service, 'applyMarking').and.returnValue(true)
      await service.process()
      expect(completedCheckDataService.sqlHasUnmarked).toHaveBeenCalled()
      expect(service.applyMarking).toHaveBeenCalledTimes(1)
    })
  })
})
