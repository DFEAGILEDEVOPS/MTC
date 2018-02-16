'use strict'
/* global describe, it, expect, spyOn, fail */

const winston = require('winston')
const checkDataService = require('../../services/data-access/check.data.service')
const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const answerDataService = require('../../services/data-access/answer.data.service')
const completedCheckMock = require('../mocks/completed-check-with-results')

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

    it('marks the answers and sets datetime of marking', async () => {
      spyOn(answerDataService, 'sqlUpdateWithResults')
      spyOn(checkDataService, 'sqlUpdateCheckWithResults').and.callFake((checkCode, marks, maxMarks, processedAt) => {
        expect(marks).toBe(9)
        expect(maxMarks).toBe(10)
        expect(checkCode).toBe('763AD270-278D-4221-886C-23FF7E5E5736')
        expect(processedAt).toBeTruthy()
      })
      await service.mark(completedCheckMock)
      expect(checkDataService.sqlUpdateCheckWithResults).toHaveBeenCalled()
    })

    it('stores the number of marks applied to each answer in the db', async () => {
      spyOn(answerDataService, 'sqlUpdateWithResults')
      spyOn(checkDataService, 'sqlUpdateCheckWithResults')
      await service.mark(completedCheckMock)
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
      await service.batchMark([1, 2, 3])
      expect(completedCheckDataService.sqlFindByIds).toHaveBeenCalledWith([1, 2, 3])
      done()
    })

    it('ignores errors from mark() and carries on processing', async (done) => {
      spyOn(completedCheckDataService, 'sqlFindByIds').and.returnValue([
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
})
