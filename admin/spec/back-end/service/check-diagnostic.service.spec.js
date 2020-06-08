'use strict'

/* globals describe expect it spyOn fail */

const sut = require('../../../services/check-diagnostic.service')
const dataService = require('../../../services/data-access/check-diagnostic.data.service')

const checkCode = 'dd3ed042-648f-49bd-a559-45127596716d'

describe('check diagnostics service', () => {
  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

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
