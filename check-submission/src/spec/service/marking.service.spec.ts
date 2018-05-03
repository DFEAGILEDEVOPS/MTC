'use strict'
/* global describe, it, expect, spyOn, fail */

const checkDataService = require('../../services/data-access/check.data.service')
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
        await service.mark({ data: '' })
        fail('expected to be thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument')
      }
    })

    it('throws an error if the arg is invalid', async () => {
      try {
        await service.mark({ data: { answers: null } })
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
})

export {}
