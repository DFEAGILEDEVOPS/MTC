'use strict'
/* global describe, it, expect spyOn fail jasmine xit */
const RA = require('ramda-adjunct')
const moment = require('moment')

const resultDataService = require('../../../services/data-access/result.data.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const resultService = require('../../../services/result.service')

describe('result.service', () => {
  describe('getPupilResultDataFromDb', () => {
    const schoolId = 0

    it('returns an object', async () => {
      const mockResultData = []
      spyOn(resultDataService, 'sqlFindPupilResultsForSchool').and.returnValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(typeof res).toBe('object')
    })

    it('has a generatedAt prop', async () => {
      const mockResultData = []
      spyOn(resultDataService, 'sqlFindPupilResultsForSchool').and.returnValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(moment.isMoment(res.generatedAt)).toBe(true)
    })

    it('has a schoolId prop', async () => {
      const mockResultData = []
      spyOn(resultDataService, 'sqlFindPupilResultsForSchool').and.returnValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.schoolId).toBe(schoolId)
    })

    it('sorts the pupils alphabetically', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: '' },
        { lastName: 'Talon', foreName: '' },
        { lastName: 'Anchovy', foreName: '' }
      ]
      spyOn(resultDataService, 'sqlFindPupilResultsForSchool').and.returnValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0].lastName).toBe('Anchovy')
      expect(res.pupils[1].lastName).toBe('Smith')
      expect(res.pupils[2].lastName).toBe('Talon')
    })

    it('sorts the pupils alphabetically - if the lastNames are the same it then sorts by foreName', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'Toad' },
        { lastName: 'Smith', foreName: 'Mario' },
        { lastName: 'Anchovy', foreName: 'Zeus' }
      ]
      spyOn(resultDataService, 'sqlFindPupilResultsForSchool').and.returnValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0].lastName).toBe('Anchovy')
      expect(res.pupils[1]).toEqual(jasmine.objectContaining({ lastName: 'Smith', foreName: 'Mario' }))
      expect(res.pupils[2]).toEqual(jasmine.objectContaining({ lastName: 'Smith', foreName: 'Toad' }))
    })

    it('sorts the pupils alphabetically - if the lastname and forenames are the same it sorts by dob', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'John', dateOfBirth: moment('1970-01-01') },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2010-01-02') },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2010-01-01') }
      ]
      spyOn(resultDataService, 'sqlFindPupilResultsForSchool').and.returnValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0]).toEqual(jasmine.objectContaining({ lastName: 'Smith', foreName: 'Jack', dateOfBirth: '1 Jan 2010' }))
      expect(res.pupils[1]).toEqual(jasmine.objectContaining({ lastName: 'Smith', foreName: 'Jack', dateOfBirth: '2 Jan 2010' }))
      expect(res.pupils[2]).toEqual(jasmine.objectContaining({ lastName: 'Smith', foreName: 'John' }))
    })

    it('sorts the pupils alphabetically - if the lastname, forename and dob are the same it sorts by middlenames', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2011-01-01'), middleNames: 'Zebra' },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2011-01-01'), middleNames: 'Xani' },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2011-01-01'), middleNames: 'Bea' }
      ]
      spyOn(resultDataService, 'sqlFindPupilResultsForSchool').and.returnValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0].middleNames).toEqual('Bea')
      expect(res.pupils[1].middleNames).toEqual('Xani')
      expect(res.pupils[2].middleNames).toEqual('Zebra')
    })

    it('returns the pupil group_id', async () => {
      const mockResultData = [
        { foreName: 'Jack', middleNames: '', lastName: 'Smith', dateOfBirth: '', group_id: 42 }
      ]
      spyOn(resultDataService, 'sqlFindPupilResultsForSchool').and.returnValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0].group_id).toBe(42)
    })

    it('returns the pupil full name', async () => {
      const mockResultData = [
        { foreName: 'Jack', middleNames: '', lastName: 'Smith', dateOfBirth: '', group_id: 42 }
      ]
      spyOn(resultDataService, 'sqlFindPupilResultsForSchool').and.returnValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0].fullName).toBe('Smith, Jack')
    })

    /**
     * This is a bug in the pupil identification flags service.
     */
    xit('returns the pupil full name with middle names if pupil differentiation requires a middleName sort', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'C' },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'B' },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'A' }
      ]
      spyOn(resultDataService, 'sqlFindPupilResultsForSchool').and.returnValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0].fullName).toBe('Smith, Jack A')
      expect(res.pupils[1].fullName).toBe('Smith, Jack B')
      expect(res.pupils[2].fullName).toBe('Smith, Jack C')
    })

    it('returns a status field for each pupil', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'C', currentCheckId: 1, checkComplete: true, attendanceReason: null, restartAvailable: false },
        { lastName: 'Testsuite', foreName: 'Jasmine', dateOfBirth: moment('2011-06-01'), middleNames: '', currentCheckId: null, checkComplete: false, attendanceReason: 'Not attending', restartAvailable: false },
        { lastName: 'Testsuite', foreName: 'Jasmine', dateOfBirth: moment('2011-06-01'), middleNames: '', currentCheckId: null, checkComplete: false, attendanceReason: '', restartAvailable: true }
      ]
      spyOn(resultDataService, 'sqlFindPupilResultsForSchool').and.returnValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0].status).toBeDefined()
    })

    it('returns a score field for each pupil that took the check', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'C', mark: 5 },
        { lastName: 'Wall', foreName: 'Jane', dateOfBirth: moment('2012-07-01'), middleNames: '', mark: 8 },
        { lastName: 'Testsuite', foreName: 'Jasmine', dateOfBirth: moment('2011-06-01'), middleNames: '', currentCheckId: null, checkComplete: false, attendanceReason: '', restartAvailable: true }
      ]
      spyOn(resultDataService, 'sqlFindPupilResultsForSchool').and.returnValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0].score).toBe(5) // Jack Smith #1
      expect(res.pupils[1].score).toBeUndefined() // Jane Wall #2
      expect(res.pupils[2].score).toBe(8) // Jasmine Testsuite #3 after sorting
    })
  })

  describe('getPupilResultData', () => {
    it('calls redisCacheService get when school id is provided', async () => {
      spyOn(redisCacheService, 'get').and.returnValue('[{}]')
      const schoolId = 2
      try {
        await resultService.getPupilResultData(schoolId)
      } catch (error) {
        fail()
      }
      expect(redisCacheService.get).toHaveBeenCalled()
    })
    it('throws an error if school id is not provided', async () => {
      spyOn(redisCacheService, 'get')
      const schoolId = undefined
      try {
        await resultService.getPupilResultData(schoolId)
        fail()
      } catch (error) {
        expect(error.message).toBe('school id not found')
      }
      expect(redisCacheService.get).not.toHaveBeenCalled()
    })
    it('returns undefined if parsing the redis response fails', async () => {
      spyOn(redisCacheService, 'get')
      const schoolId = 1
      let result
      try {
        result = await resultService.getPupilResultData(schoolId)
      } catch (error) {
        fail()
      }
      expect(result).toBeUndefined()
    })
  })

  describe('createPupilData', () => {
    it('assigns a score to a pupil with a completed check', () => {
      const data = [
        { pupilId: 1, mark: 10, foreName: 'Joe', lastName: 'Test' }
      ]
      const result = resultService.createPupilData(data) // sut
      expect(RA.isArray(result)).toBe(true)
    })
  })

  describe('assignStatus', () => {
    const sut = resultService.assignStatus

    it('describes complete pupils with no status', () => {
      const pupil = { restartAvailable: false, currentCheckId: 1, checkComplete: true }
      const status = sut(pupil)
      expect(status).toBe('')
    })

    it('describes incomplete pupils with an incomplete status', () => {
      const pupil = { restartAvailable: false, currentCheckId: 2, checkComplete: false }
      const status = sut(pupil)
      expect(status).toBe('Incomplete')
    })

    it('describes pupils who did not take a check', () => {
      const pupil = { restartAvailable: false, currentCheckId: null, checkComplete: false, attendanceId: false }
      const status = sut(pupil)
      expect(status).toBe('Did not participate')
    })

    it('describes pupils who are marked as not attending', () => {
      const pupil = {
        restartAvailable: false,
        currentCheckId: null,
        checkComplete: false,
        attendanceReason: 'any of the reasons for not attending'
      }
      const status = sut(pupil)
      expect(status).toBe('any of the reasons for not attending')
    })
  })
}) // end result service
