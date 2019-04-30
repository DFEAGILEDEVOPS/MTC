'use strict'

/* global describe expect it spyOn */

const context = require('../mock-context')
const sqlUtil = require('../lib/sql-helper')
const v1 = require('./v1')

describe('completed-checks: v1', () => {
  describe('handleCompletedCheck', () => {
    it('throws an error because `clientCheckStartedAt` has been supplied', async () => {
      let thisError = false
      try {
        await v1.process(context, { clientCheckStartedAt: 'foo-bar' })
      } catch (error) {
        thisError = error
      }
      expect(thisError instanceof Error).toBeTruthy()
      expect(thisError.message).toMatch(/clientCheckStartedAt/)
    })
    it('does not throw an error because of `clientCheckStartedAt`', async () => {
      spyOn(sqlUtil, 'sqlFindCheckWithFormDataByCheckCode').and.throwError('foo-bar')
      let thisError = false
      try {
        await v1.process(context, { checkCode: 'foo-bar' })
      } catch (error) {
        thisError = error
      }
      expect(sqlUtil.sqlFindCheckWithFormDataByCheckCode).toHaveBeenCalled()
      expect(thisError instanceof Error).toBeTruthy()
      expect(thisError.message).toBe('foo-bar')
    })
  })
})
