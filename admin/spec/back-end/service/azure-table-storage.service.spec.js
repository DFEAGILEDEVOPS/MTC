'use strict'

const sut = require('../../../services/azure-table-storage.service')
const azureTableDataService = require('../../../services/data-access/azure-table.data.service')
const mockSchoolUUID = '4001ab7d-56d7-4ee2-a592-0187d18216be'
const mockCheckCode = 'c0df54bc-681a-48cc-9a0b-36658aef78ef'
const moment = require('moment')

// This mock is obviously inconsistent - it's only purpose is to satisfy these tests, which do not validate this structure.
const mockMarkedAnswers = [
  {
    factor1: 1,
    factor2: 1,
    answer: 1,
    sequenceNumber: 1,
    question: '1x1',
    clientTimestamp: '2022-02-23T12:07:13+0000',
    isCorrect: true
  },
  {
    factor1: 1,
    factor2: 2,
    answer: 2,
    sequenceNumber: 2,
    question: '1x2',
    clientTimestamp: '2022-02-23T12:07:42+0000',
    isCorrect: true
  }
]

const mockRawMarkedCheck = {
  partitionKey: mockSchoolUUID,
  rowKey: mockCheckCode,
  timestamp: '2022-02-23T12:04:57+0000',
  mark: 7,
  maxMarks: 25,
  markedAnswers: JSON.stringify(mockMarkedAnswers),
  markedAt: '2022-02-23T12:05:43+0000'
}

const mockRawReceivedCheck = {
  partitionKey: mockSchoolUUID,
  rowKey: mockCheckCode,
  timestamp: '2022-02-23T13:04:58+0000',
  checkReceivedAt: '2022-02-23T15:55:34+0000',
  checkVersion: 2,
  isValid: true,
  processingError: '',
  validatedAt: '2022-02-23T15:57:04+0000',
  answers: JSON.stringify(mockMarkedAnswers)
}

describe('check diagnostics service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#retrieveMarkedCheck', () => {
    beforeEach(() => {
      jest.spyOn(azureTableDataService, 'retrieveEntity').mockImplementation()
    })

    test('it throws an error if the school uuid is not provided', async () => {
      await expect(sut.retrieveMarkedCheck(undefined, mockCheckCode)).rejects.toThrow('Invalid UUID given for school')
    })

    test('it throws an error if the checkCode is not provided', async () => {
      await expect(sut.retrieveMarkedCheck(mockSchoolUUID, undefined)).rejects.toThrow('Invalid UUID given for checkCode')
    })

    test('it makes a call to the table service to fetch the entity', async () => {
      jest.spyOn(azureTableDataService, 'retrieveEntity').mockResolvedValue(mockRawMarkedCheck)
      await sut.retrieveMarkedCheck(mockSchoolUUID, mockCheckCode)
      expect(azureTableDataService.retrieveEntity).toHaveBeenCalledWith('checkResult', mockSchoolUUID, mockCheckCode)
    })

    test('it returns undefined if the entity is not found in azure storage', async () => {
      jest.spyOn(azureTableDataService, 'retrieveEntity').mockResolvedValue(undefined)
      const res = await sut.retrieveMarkedCheck(mockSchoolUUID, mockCheckCode)
      expect(res).toBeUndefined()
    })

    test('it returns the hydrated entity', async () => {
      jest.spyOn(azureTableDataService, 'retrieveEntity').mockResolvedValue(mockRawMarkedCheck)
      const res = await sut.retrieveMarkedCheck(mockSchoolUUID, mockCheckCode)
      expect(res.partitionKey).toBeDefined()
      expect(res.rowKey).toBeDefined()
      expect(moment.isMoment(res.timestamp)).toBe(true)
      expect(res.mark).toBe(7)
      expect(res.maxMarks).toBe(25)
      expect(moment.isMoment(res.markedAnswers[0].clientTimestamp)).toBe(true)
      expect(moment.isMoment(res.markedAt)).toBe(true)
    })
  })

  describe('#retrieveReceivedCheck', () => {
    beforeEach(() => {
      jest.spyOn(azureTableDataService, 'retrieveEntity').mockImplementation()
    })

    test('it throws an error if the school uuid is not provided', async () => {
      await expect(sut.retrieveReceivedCheck(undefined, mockCheckCode)).rejects.toThrow('Invalid UUID given for school')
    })

    test('it throws an error if the checkCode is not provided', async () => {
      await expect(sut.retrieveReceivedCheck(mockSchoolUUID, undefined)).rejects.toThrow('Invalid UUID given for checkCode')
    })

    test('it makes a call to the table service to fetch the entity', async () => {
      jest.spyOn(azureTableDataService, 'retrieveEntity').mockResolvedValue(mockRawReceivedCheck)
      await sut.retrieveReceivedCheck(mockSchoolUUID, mockCheckCode)
      expect(azureTableDataService.retrieveEntity).toHaveBeenCalledWith('receivedCheck', mockSchoolUUID, mockCheckCode)
    })

    test('it returns undefined if the entity is not found in azure storage', async () => {
      jest.spyOn(azureTableDataService, 'retrieveEntity').mockResolvedValue(undefined)
      const res = await sut.retrieveReceivedCheck(mockSchoolUUID, mockCheckCode)
      expect(res).toBeUndefined()
    })

    test('it returns the hydrated entity', async () => {
      jest.spyOn(azureTableDataService, 'retrieveEntity').mockResolvedValue(mockRawReceivedCheck)
      const res = await sut.retrieveReceivedCheck(mockSchoolUUID, mockCheckCode)
      expect(res.partitionKey).toBeDefined()
      expect(res.rowKey).toBeDefined()
      expect(moment.isMoment(res.timestamp)).toBe(true)
      expect(moment.isMoment(res.checkReceivedAt)).toBe(true)
      expect(res.checkVersion).toBe(2)
      expect(res.isValid).toBe(true)
      expect(res.processingError).toBeDefined()
      expect(moment.isMoment(res.validatedAt)).toBe(true)
      expect(moment.isMoment(res.answers[0].clientTimestamp)).toBe(true)
    })
  })
})
