'use strict'

/* global describe it expect beforeEach spyOn */

const checkFormService = require('../../services/check-form.service')
const checkWindowDataService = require('../../services/data-access/check-window.data.service')
const checkDataService = require('../../services/data-access/check.data.service')

describe('check-start.service', () => {
  describe('startCheck', () => {
    let service
    beforeEach(() => {
      service = require('../../services/check-start.service')
    })

    describe('happy path', () => {
      it('returns a checkCode and a checkForm', async (done) => {
        spyOn(checkFormService, 'allocateCheckForm').and.returnValue({
          id: 12345
        })
        spyOn(checkWindowDataService, 'sqlFindOneCurrent').and.returnValue({
          id: 45678
        })
        spyOn(checkDataService, 'sqlCreate').and.returnValue(Promise.resolve())
        try {
          const res = await service.startCheck(789)
          expect(res.checkCode).toBeDefined()
          expect(res.checkForm.id).toBe(12345)
          expect(checkDataService.sqlCreate).toHaveBeenCalled()
        } catch (error) {
          // we are not expecting the happy path to throw
          expect(error).toBeUndefined()
        }
        done()
      })
    })
  })
})
