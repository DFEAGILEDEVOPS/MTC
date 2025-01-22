'use strict'

const sut = require('../../../services/check-diagnostic.service')
const dataService = require('../../../services/data-access/check-diagnostic.data.service')
const schoolService = require('../../../services/school.service')
const azureTableStorageService = require('../../../services/azure-table-storage.service')
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

  describe('#getMarkedCheckEntityByCheckCode', () => {
    beforeEach(() => {
      jest.spyOn(sut, 'getByCheckCode').mockResolvedValue({ checkCode: '1234', school_id: 42 })
      jest.spyOn(schoolService, 'findOneById').mockResolvedValue({ urlSlug: '4567' })
      jest.spyOn(azureTableStorageService, 'retrieveMarkedCheck').mockResolvedValue({ mock: 'markedCheck' })
    })

    test('it throws an error if a checkcode is not provided', async () => {
      await expect(sut.getMarkedCheckEntityByCheckCode()).rejects.toThrow('checkCode is required')
    })

    test('it calls the service to retrieve the received check, and returns the result', async () => {
      const res = await sut.getMarkedCheckEntityByCheckCode(checkCode)
      expect(azureTableStorageService.retrieveMarkedCheck).toHaveBeenCalledWith('4567', '1234')
      expect(res).toEqual({ mock: 'markedCheck' })
    })
  })

  describe('#getReceivedCheckEntityByCheckCode', () => {
    beforeEach(() => {
      jest.spyOn(sut, 'getByCheckCode').mockResolvedValue({ checkCode: '1234', school_id: 42 })
      jest.spyOn(schoolService, 'findOneById').mockResolvedValue({ urlSlug: '4567' })
      jest.spyOn(azureTableStorageService, 'retrieveReceivedCheck').mockResolvedValue({ mock: 'receivedCheck' })
    })

    test('it throws an error if a checkcode is not provided', async () => {
      await expect(sut.getReceivedCheckEntityByCheckCode()).rejects.toThrow('checkCode is required')
    })

    test('it calls the service to retrieve the received check, and returns the result', async () => {
      const res = await sut.getReceivedCheckEntityByCheckCode(checkCode)
      expect(azureTableStorageService.retrieveReceivedCheck).toHaveBeenCalledWith('4567', '1234')
      expect(res).toEqual({ mock: 'receivedCheck' })
    })
  })
})
