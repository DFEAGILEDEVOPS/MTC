'use strict'

/* global describe, it, expect, fail spyOn */
const sut = require('../../../../services/tech-support/check-completion-queue.service')
const dataService = require('../../../../services/data-access/tech-support/check-completion-queue.data.service')

describe('check-completion-queue-service', () => {
  it('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('createMessageForSingleCheck', () => {
    it('should throw if checkCode not provided', async () => {
      try {
        await sut.createMessageForSingleCheck()
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toEqual('checkCode parameter is required')
      }
    })

    it('should lookup schoolUuid via checkCode', async () => {
      const expectedSchoolUuid = 'expected-school-uuid'
      const receivedCheckMock = {
        receviedCheck: 'received-check-mock'
      }
      const checkResultMock = {
        markedCheck: 'check-result-mock'
      }
      spyOn(dataService, 'getSchoolUuidByCheckCode').and.returnValue(expectedSchoolUuid)
      spyOn(dataService, 'getReceivedCheck').and.returnValue(receivedCheckMock)
      spyOn(dataService, 'getCheckResult').and.returnValue(checkResultMock)
      const checkCode = '8567da31-126f-49e1-b422-b111a5f21fdf'
      const result = await sut.createMessageForSingleCheck(checkCode)
      expect(result.validatedCheck).toEqual(receivedCheckMock)
      expect(result.markedCheck).toEqual(checkResultMock)
      expect(dataService.getSchoolUuidByCheckCode).toHaveBeenCalledWith(checkCode)
      expect(dataService.getReceivedCheck).toHaveBeenCalledWith(expectedSchoolUuid, checkCode)
      expect(dataService.getCheckResult).toHaveBeenCalledWith(expectedSchoolUuid, checkCode)
    })
  })
})
