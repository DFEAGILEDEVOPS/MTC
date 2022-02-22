'use strict'

/* globals describe expect test jest afterEach */

const sut = require('../../../services/check-diagnostic.service')
const dataService = require('../../../services/data-access/check-diagnostic.data.service')

const checkCode = 'dd3ed042-648f-49bd-a559-45127596716d'

describe('check diagnostics service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('#getByCheckCode', () => {
    test('should return check record when exists', async () => {
      jest.spyOn(dataService, 'getByCheckCode').mockResolvedValue([{}])
      const actual = await sut.getByCheckCode(checkCode)
      expect(typeof actual).toBe('object')
    })

    test('should return undefined when check not found', async () => {
      jest.spyOn(dataService, 'getByCheckCode').mockResolvedValue(undefined)
      const actual = await sut.getByCheckCode(checkCode)
      expect(actual).toBeUndefined()
    })

    test('should throw error when checkCode not provided', async () => {
      await expect(sut.getByCheckCode()).rejects.toThrow('checkCode is required')
    })

    test('should trim spaces from checkCode before passing to data service', async () => {
      jest.spyOn(dataService, 'getByCheckCode').mockResolvedValue([{}])
      const spacedCheckCode = ` ${checkCode} `
      await sut.getByCheckCode(spacedCheckCode)
      expect(dataService.getByCheckCode).toHaveBeenCalledWith(checkCode)
    })
  })
})
