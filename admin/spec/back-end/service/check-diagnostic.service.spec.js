'use strict'

/* globals describe expect it spyOn fail beforeAll xdescribe */

// these modules must be loaded first
const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

const sut = require('../../../services/check-diagnostic.service')
const dataService = require('../../../services/data-access/check-diagnostic.data.service')

const checkCode = 'dd3ed042-648f-49bd-a559-45127596716d'

describe('check diagnostics service', () => {
  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('getByCheckCode', () => {
    it('should return check record when exists', async () => {
      spyOn(dataService, 'getByCheckCode').and.returnValue([{}])
      const actual = await sut.getByCheckCode(checkCode)
      expect(typeof actual).toBe('object')
    })

    it('should return undefined when check not found', async () => {
      spyOn(dataService, 'getByCheckCode').and.returnValue(undefined)
      const actual = await sut.getByCheckCode(checkCode)
      expect(actual).toBeUndefined()
    })

    it('should throw error when checkCode not provided', async () => {
      try {
        await sut.getByCheckCode()
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toEqual('checkCode is required')
      }
    })

    it('should trim spaces from checkCode before passing to data service', async () => {
      spyOn(dataService, 'getByCheckCode').and.returnValue([{}])
      const spacedCheckCode = ` ${checkCode} `
      await sut.getByCheckCode(spacedCheckCode)
      expect(dataService.getByCheckCode).toHaveBeenCalledWith(checkCode)
    })
  })

  describe('compareResultsToPayload', () => {
    it('should throw error when checkCodes is undefined', async () => {
      try {
        await sut.compareResultsToPayload()
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('checkCodes array is required')
      }
    })

    it('should throw error when checkCodes is not an array', async () => {
      try {
        await sut.compareResultsToPayload('edd48f70-7366-46e3-8771-27fafddafba7')
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('checkCodes array is required')
      }
    })
  })
})
