'use strict'

/* global describe expect it spyOn jasmine */
const RA = require('ramda-adjunct')
const { v4: uuidv4 } = require('uuid')

const sut = require('./results.service.js')
const dataService = require('./data-access/data.service.js')
const azureStorageHelper = require('../../lib/azure-storage-helper')
const MarkedCheck = require('../marked-check.class')
const MarkedAnswer = require('../marked-answer.class')

const markedAnswers = [
  { factor1: 1, factor2: 2, answer: '2', question: '1x2', clientTimestamp: '2020-05-19T07:47:14.092Z' },
  { factor1: 1, factor2: 3, answer: '3', question: '1x3', clientTimestamp: '2020-05-19T07:47:14.092Z' },
  { factor1: 1, factor2: 4, answer: '4', question: '1x4', clientTimestamp: '2020-05-19T07:47:14.092Z' }
]
const markedAnswersString = JSON.stringify(markedAnswers)

describe('results.service', () => {
  it('is defined', () => {
    expect(sut).toBeDefined()
  })

  describe('#getNewChecks', () => {
    it('has a getNewChecks function', () => {
      spyOn(dataService, 'sqlGetNewChecks')
      expect(typeof sut.getNewChecks).toBe('function')
    })

    it('returns a promise', () => {
      spyOn(dataService, 'sqlGetNewChecks')
      const p = sut.getNewChecks()
      expect(p instanceof Promise).toBeTrue()
    })

    it('makes a call to the data service to fetch the new checks', async () => {
      spyOn(dataService, 'sqlGetNewChecks').and.returnValue([1, 2, 3])
      await sut.getNewChecks()
      expect(dataService.sqlGetNewChecks).toHaveBeenCalledTimes(1)
    })
  })

  describe('#getSchoolResults', () => {
    it('#is defined', () => {
      expect(typeof sut.getSchoolResults).toBe('function')
    })

    it('returns an array of MarkedChecks', async () => {
      const mockAsyncAzureStorage = jasmine.createSpyObj('mockAsyncAzureStorage', ['queryEntitiesAsync'])
      spyOn(azureStorageHelper, 'getPromisifiedAzureTableService').and.returnValue(mockAsyncAzureStorage)

      // set up the spies

      mockAsyncAzureStorage.queryEntitiesAsync.and.returnValue({
        result: {
          entries: [
            {
              PartitionKey: { _: uuidv4() },
              RowKey: { _: uuidv4() },
              Timestamp: { _: '2020-05-19T07:47:14.092Z' },
              mark: { _: '3' },
              markedAnswers: { _: JSON.stringify(markedAnswers) },
              markedAt: { _: '2020-05-19T07:47:14.092Z' },
              maxMarks: { _: '3' },
              foo: { _: 4 }
            },
            {
              PartitionKey: { _: uuidv4() },
              RowKey: { _: uuidv4() },
              Timestamp: { _: '2020-05-19T07:47:16.010Z' },
              mark: { _: '3' },
              markedAnswers: { _: JSON.stringify(markedAnswers) },
              markedAt: { _: '2020-05-19T07:47:16.010Z' },
              maxMarks: { _: '3' }
            }
          ]
        }
      })
      const result = await sut.getSchoolResults(uuidv4())
      expect(RA.isArray(result)).toBe(true)
      expect(result.every(o => o instanceof MarkedCheck)).toBe(true)
      result.forEach(o => {
        expect(o.markedAnswers.every(a => a instanceof MarkedAnswer)).toBe(true)
      })
    })
  })

  describe('#getSchoolsWithNewSchools', () => {
    it('calls the data service', async () => {
      spyOn(dataService, 'sqlGetSchoolsWithNewChecks').and.returnValue([
        { id: 1, name: 'Test 1', schoolGuid: uuidv4() },
        { id: 2, name: 'Test 2', schoolGuid: uuidv4() }
      ])
      const result = await sut.getSchoolsWithNewChecks()
      expect(RA.isArray(result)).toBe(true)
      expect(dataService.sqlGetSchoolsWithNewChecks).toHaveBeenCalledTimes(1)
    })
  })

  describe('#findNewMarkedChecks', () => {
    it('is defined', () => {
      expect(sut.findNewMarkedChecks).toBeDefined()
    })

    it('returns only the new marked checks that we want', () => {
      const newChecks = [
        { id: 3, checkCode: 'test3' },
        { id: 4, checkCode: 'test4' }
      ]
      const markedChecks = [1, 2, 3, 4].map(i => {
        return new MarkedCheck(`test${i}`,
          uuidv4(),
          markedAnswersString,
          3,
          '2020-05-19T14:15:50.160Z')
      })
      const result = sut.findNewMarkedChecks(newChecks, markedChecks)
      expect(RA.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
      expect(result.every(o => o instanceof MarkedCheck)).toBe(true)
    })
  })

  describe('#persistMarkingData', () => {
    it('is defined', () => {
      expect(sut.persistMarkingData).toBeDefined()
    })

    it('calls the data service', async () => {
      const markedChecks = [] // dummy payload
      spyOn(dataService, 'sqlPersistMarkingData')
      await dataService.sqlPersistMarkingData(markedChecks)
      expect(dataService.sqlPersistMarkingData).toHaveBeenCalledTimes(1)
    })
  })
})
