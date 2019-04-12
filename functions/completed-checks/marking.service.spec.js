'use strict'
/* global describe, it, expect, spyOn, fail, beforeAll */

const completedCheckMock = require('./mocks/completed-check-with-results')
const checkFormMock = require('./mocks/check-form')

describe('markingService', () => {
  let service, sqlHelper

  beforeAll(() => {
    // sql-helper connects to the database as a side-effect of requiring it.
    sqlHelper = require('../lib/sql-helper')
    service = require('./marking.service')
  })

  describe('#mark', () => {
    it('throws an error if the arg is missing', async () => {
      try {
        await service.mark()
        fail('expected to be thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument: completed check message')
      }
    })

    it('throws an error if the arg completedCheckMessage answers property is empty', async () => {
      try {
        await service.mark({ answers: null }, undefined)
        fail('expected to be thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument: completed check message')
      }
    })

    it('throws an error if the check data are missing', async () => {
      try {
        await service.mark({ ...completedCheckMock }, undefined)
        fail('expected to be thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument: check data')
      }
    })

    it('throws an error if the check id is missing', async () => {
      try {
        await service.mark({ ...completedCheckMock }, { id: undefined, formData: checkFormMock.formData })
        fail('expected to be thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument: check data')
      }
    })

    it('throws an error if the check formData are missing', async () => {
      try {
        await service.mark({ ...completedCheckMock }, { id: 1, formData: undefined })
        fail('expected to be thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument: check data')
      }
    })

    it('marks the answers and sets datetime of marking', async () => {
      spyOn(sqlHelper, 'sqlUpdateAnswersWithResults')
      spyOn(sqlHelper, 'sqlUpdateCheckWithResults').and.callFake((checkCode, marks, maxMarks, processedAt) => {
        expect(marks).toBe(9)
        expect(maxMarks).toBe(10)
        expect(checkCode).toBe('763AD270-278D-4221-886C-23FF7E5E5736')
        expect(processedAt).toBeTruthy()
      })
      await service.mark({ ...completedCheckMock }, { id: 1, formData: checkFormMock.formData })
      expect(sqlHelper.sqlUpdateCheckWithResults).toHaveBeenCalled()
    })

    it('stores the number of marks applied to each answer in the db', async () => {
      spyOn(sqlHelper, 'sqlUpdateAnswersWithResults')
      spyOn(sqlHelper, 'sqlUpdateCheckWithResults')
      const checkForm = Object.assign({}, checkFormMock)
      checkForm.formData = JSON.parse(checkForm.formData)
      await service.mark({ ...completedCheckMock }, { id: 1, formData: checkFormMock.formData })
      expect(sqlHelper.sqlUpdateAnswersWithResults).toHaveBeenCalled()
    })
  })
})
