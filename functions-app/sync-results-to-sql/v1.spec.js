'use strict'
/* global describe, it, expect, spyOn, beforeEach */
const { v4: uuidv4 } = require('uuid')

const sut = require('./v1.js')
const resultsService = require('./service/results.service')

describe('sync-results-to-sql:v1', () => {
  beforeEach(() => {
    spyOn(console, 'log') // trap line 33
  })

  it('has an entry-point function', () => {
    expect(typeof sut.process).toBe('function')
  })

  it('process calls processSchool one at a time', async () => {
    const schools = [1, 2, 3].map(i => { return { id: i, name: `Test ${i}`, schoolGuid: uuidv4() } })
    spyOn(sut, 'processSchool')
    spyOn(resultsService, 'getSchoolsWithNewChecks').and.returnValue(schools)
    await sut.process(schools)
    expect(sut.processSchool).toHaveBeenCalledTimes(3)
  })

  describe('#processSchool', () => {
    beforeEach(() => {
      spyOn(resultsService, 'getNewChecks')
      spyOn(resultsService, 'getSchoolResults')
      spyOn(resultsService, 'findNewMarkedChecks')
      spyOn(resultsService, 'persistMarkingData')
    })

    it('is defined', () => {
      expect(sut.processSchool).toBeDefined()
    })

    it('calls a service to persist the data to the SQL DB', async () => {
      await sut.processSchool({ id: 1, name: 'Test', schoolGuid: uuidv4() })
      expect(resultsService.persistMarkingData).toHaveBeenCalledTimes(1)
    })z
  })
})
