'use strict'
/* global describe, beforeEach, afterEach, it, expect, spyOn */
const checkDataService = require('../../services/data-access/check.data.service')
const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const completedCheckMock = require('../mocks/completed-check')

describe('markingService', () => {
  let service = require('../../services/marking.service')

  describe('#mark', () => {
    it('throws an error if the arg is missing', async (done) => {
      try {
        await service.mark()
        expect('this').toBe('thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument')
      }
      done()
    })

    it('throws an error if the arg is invalid', async (done) => {
      try {
        await service.mark({data: ''})
        expect('this').toBe('thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument')
      }
      done()
    })

    it('throws an error if the arg is invalid', async (done) => {
      try {
        await service.mark({data: {answers: null}})
        expect('this').toBe('thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument')
      }
      done()
    })

    it('marks the answers and sets datetime of marking', async (done) => {
      spyOn(checkDataService, 'sqlUpdateCheckWithResults').and.callFake((checkCode, marks, maxMarks, processedAt) => {
        expect(marks).toBe(3)
        expect(maxMarks).toBe(6)
        expect(checkCode).toBe('b31de43f-87f1-47f3-94df-1ec608d2af3f')
        expect(processedAt).toBeTruthy()
      })
      await service.mark(completedCheckMock)
      expect(checkDataService.sqlUpdateCheckWithResults).toHaveBeenCalled()
      done()
    })
  })

  describe('#batchMark', () => {
    it('throws an error if called without an arg', async (done) => {
      try {
        await service.batchMark()
        expect('this').toBe('thrown')
      } catch (err) {
        expect(err.message).toBe('Missing arg batchIds')
      }
      done()
    })

    it('throws an error if called with an empty array', async (done) => {
      try {
        await service.batchMark([])
        expect('this').toBe('thrown')
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
      expect(completedCheckDataService.sqlFindByIds).toHaveBeenCalled()
      done()
    })

    it('ignores errors from mark() and carries on processing', async (done) => {
      spyOn(completedCheckDataService, 'sqlFindByIds').and.returnValue([
        {}, {}, {}
      ])
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
