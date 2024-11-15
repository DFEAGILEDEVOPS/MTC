'use strict'
const RA = require('ramda-adjunct')
const moment = require('moment')

const resultDataService = require('../../../services/data-access/result.data.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const resultService = require('../../../services/result.service')
const featureToggles = require('feature-toggles')

describe('result.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getPupilResultDataFromDb', () => {
    const schoolId = 0

    test('returns an object', async () => {
      const mockResultData = []
      jest.spyOn(resultDataService, 'sqlFindPupilResultsForSchool').mockResolvedValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(typeof res).toBe('object')
    })

    test('has a generatedAt prop', async () => {
      const mockResultData = []
      jest.spyOn(resultDataService, 'sqlFindPupilResultsForSchool').mockResolvedValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(moment.isMoment(res.generatedAt)).toBe(true)
    })

    test('has a schoolId prop', async () => {
      const mockResultData = []
      jest.spyOn(resultDataService, 'sqlFindPupilResultsForSchool').mockResolvedValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.schoolId).toBe(schoolId)
    })

    test('sorts the pupils alphabetically', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: '', middleNames: '', dateOfBirth: moment('2010-07-01T00:00Z') },
        { lastName: 'Talon', foreName: '', middleNames: '', dateOfBirth: moment('2010-07-02T00:00Z') },
        { lastName: 'Anchovy', foreName: '', middleNames: '', dateOfBirth: moment('2010-07-02T00:00Z') }
      ]
      jest.spyOn(resultDataService, 'sqlFindPupilResultsForSchool').mockResolvedValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0].lastName).toBe('Anchovy')
      expect(res.pupils[1].lastName).toBe('Smith')
      expect(res.pupils[2].lastName).toBe('Talon')
    })

    test('sorts the pupils alphabetically - if the lastNames are the same it then sorts by foreName', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'Toad', middleNames: '', dateOfBirth: moment('2010-07-01T00:00Z') },
        { lastName: 'Smith', foreName: 'Mario', middleNames: '', dateOfBirth: moment('2010-07-01T00:00Z') },
        { lastName: 'Anchovy', foreName: 'Zeus', middleNames: '', dateOfBirth: moment('2010-07-01T00:00Z') }
      ]
      jest.spyOn(resultDataService, 'sqlFindPupilResultsForSchool').mockResolvedValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0].lastName).toBe('Anchovy')
      expect(res.pupils[1]).toEqual(expect.objectContaining({ lastName: 'Smith', foreName: 'Mario' }))
      expect(res.pupils[2]).toEqual(expect.objectContaining({ lastName: 'Smith', foreName: 'Toad' }))
    })

    test('sorts the pupils alphabetically - if the lastname and forenames are the same it sorts by dob', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'John', middleNames: 'one', dateOfBirth: moment('1970-01-01') },
        { lastName: 'Smith', foreName: 'Jack', middleNames: 'two', dateOfBirth: moment('2010-01-02') },
        { lastName: 'Smith', foreName: 'Jack', middleNames: 'three', dateOfBirth: moment('2010-01-01') }
      ]
      jest.spyOn(resultDataService, 'sqlFindPupilResultsForSchool').mockResolvedValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0]).toEqual(expect.objectContaining({ lastName: 'Smith', foreName: 'Jack', middleNames: 'three' }))
      expect(res.pupils[1]).toEqual(expect.objectContaining({ lastName: 'Smith', foreName: 'Jack', middleNames: 'two' }))
      expect(res.pupils[2]).toEqual(expect.objectContaining({ lastName: 'Smith', foreName: 'John' }))
    })

    test('sorts the pupils alphabetically - if the lastname, forename and dob are the same it sorts by middlenames', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2013-01-01'), middleNames: 'Zebra' },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2013-01-01'), middleNames: 'Xani' },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2013-01-01'), middleNames: 'Bea' }
      ]
      jest.spyOn(resultDataService, 'sqlFindPupilResultsForSchool').mockResolvedValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      // Note: there is a bug in the pupil identification flag service that is causing the Xani record dateOfBirth to be set to
      // an empty string due to double processing, and the fact that it operates as a presenter and a service.
      // This manifests as this line of output during the test run: 'Date parameter is not a Date or Moment object: 1 Jan 2013'
      expect(res.pupils[0].middleNames).toEqual('Bea')
      expect(res.pupils[1].middleNames).toEqual('Xani')
      expect(res.pupils[2].middleNames).toEqual('Zebra')
    })

    test('returns the pupil group_id', async () => {
      const mockResultData = [
        { foreName: 'Jack', middleNames: '', lastName: 'Smith', dateOfBirth: moment('2010-08-01'), group_id: 42 }
      ]
      jest.spyOn(resultDataService, 'sqlFindPupilResultsForSchool').mockResolvedValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0].group_id).toBe(42)
    })

    test('returns the pupil full name', async () => {
      const mockResultData = [
        { foreName: 'Jack', middleNames: '', lastName: 'Smith', dateOfBirth: moment('2010-08-01'), group_id: 42 }
      ]
      jest.spyOn(resultDataService, 'sqlFindPupilResultsForSchool').mockResolvedValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0].fullName).toBe('Smith, Jack')
    })

    test('returns the pupil full name with middle names if pupil differentiation requires a middleName sort', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'C' },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'B' },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'A' }
      ]
      jest.spyOn(resultDataService, 'sqlFindPupilResultsForSchool').mockResolvedValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0].fullName).toBe('Smith, Jack A')
      expect(res.pupils[1].fullName).toBe('Smith, Jack B')
      expect(res.pupils[2].fullName).toBe('Smith, Jack C')
    })

    test('returns a status field for each pupil', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'C', currentCheckId: 1, checkComplete: true, attendanceReason: null, restartAvailable: false },
        { lastName: 'Testsuite', foreName: 'Jasmine', dateOfBirth: moment('2011-06-01'), middleNames: '', currentCheckId: null, checkComplete: false, attendanceReason: 'Not attending', restartAvailable: false },
        { lastName: 'Testsuite', foreName: 'Jasmine', dateOfBirth: moment('2011-06-01'), middleNames: '', currentCheckId: null, checkComplete: false, attendanceReason: '', restartAvailable: true }
      ]
      jest.spyOn(resultDataService, 'sqlFindPupilResultsForSchool').mockResolvedValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0].status).toBeDefined()
    })

    test('returns a score field for each pupil that took the check', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'C', mark: 5 },
        { lastName: 'Wall', foreName: 'Jane', dateOfBirth: moment('2012-07-01'), middleNames: '', mark: 8 },
        { lastName: 'Testsuite', foreName: 'Jasmine', dateOfBirth: moment('2011-06-01'), middleNames: '', currentCheckId: null, checkComplete: false, attendanceReason: '', restartAvailable: true }
      ]
      jest.spyOn(resultDataService, 'sqlFindPupilResultsForSchool').mockResolvedValue(mockResultData)
      const res = await resultService.getPupilResultDataFromDb(schoolId)
      expect(res.pupils[0].score).toBe(5) // Jack Smith #1
      expect(res.pupils[1].score).toBeUndefined() // Jane Wall #2
      expect(res.pupils[2].score).toBe(8) // Jasmine Testsuite #3 after sorting
    })
  })

  describe('getPupilResultData', () => {
    test('calls redisCacheService get when school id is provided', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue('[{}]')
      const schoolId = 2
      try {
        await resultService.getPupilResultData(schoolId)
      } catch {
        fail()
      }
      expect(redisCacheService.get).toHaveBeenCalled()
    })

    test('throws an error if school id is not provided', async () => {
      jest.spyOn(redisCacheService, 'get').mockImplementation()
      const schoolId = undefined
      try {
        await resultService.getPupilResultData(schoolId)
        fail()
      } catch (error) {
        expect(error.message).toBe('school id not found')
      }
      expect(redisCacheService.get).not.toHaveBeenCalled()
    })

    test('returns undefined if parsing the redis response fails', async () => {
      jest.spyOn(redisCacheService, 'get').mockImplementation()
      const schoolId = 1
      let result
      try {
        result = await resultService.getPupilResultData(schoolId)
      } catch (error) {
        fail()
      }
      expect(result).toBeUndefined()
    })

    test('saves the result to redis if it queried the database', async () => {
      // setup
      const schoolId = 1
      jest.spyOn(redisCacheService, 'get').mockReturnValue(undefined) // initial cache miss from redis
      jest.spyOn(redisCacheService, 'set').mockImplementation() // spy on the write to redis
      const resultData = {
        generatedAt: moment('2020-06-03T11:23:45'),
        schoolId,
        pupils: [
          { fullName: 'Smith, Jon', score: 10, status: '', group_id: 4, urlSlug: 'aaa' },
          { fullName: 'Everett, Katy', score: 9, status: '', group_id: 4, urlSlug: 'bbb' }
        ]
      }
      jest.spyOn(resultService, 'getPupilResultDataFromDb').mockResolvedValue(resultData)
      jest.spyOn(featureToggles, 'isFeatureEnabled').mockImplementation(arg => {
        if (arg === 'schoolResultFetchFromDbEnabled') { return true }
        return undefined
      })

      // exec
      await resultService.getPupilResultData(schoolId)

      // test
      expect(resultService.getPupilResultDataFromDb).toHaveBeenCalledTimes(1)
      expect(redisCacheService.set).toHaveBeenCalledTimes(1)
    })
  })

  describe('createPupilData', () => {
    test('assigns a score to a pupil with a completed check', () => {
      const data = [
        { pupilId: 1, mark: 10, foreName: 'Joe', lastName: 'Test' }
      ]
      const result = resultService.createPupilData(data) // sut
      expect(RA.isArray(result)).toBe(true)
    })

    test('returns the right shaped object', () => {
      const data = [
        {
          foreName: 'Jon',
          lastName: 'Programmer',
          middleNames: 'bbb',
          group_id: 12,
          dateOfBirth: moment.utc('2020-01-01'),
          mark: 9,
          foo: 'bar',
          urlSlug: 'aaa',
          attendanceCode: 'LEFTT'
        }
      ]
      const result = resultService.createPupilData(data) // sut
      expect(result[0]).toEqual(expect.objectContaining({
        foreName: 'Jon',
        group_id: 12,
        lastName: 'Programmer',
        middleNames: 'bbb',
        score: 9,
        status: 'Incomplete',
        urlSlug: 'aaa',
        attendanceCode: 'LEFTT'
      }))

      // Handle the dateOfBirth prop as a special case as moment objects are not equal even if they have the same date
      // It should be output as a moment object just the same as the input - passed through
      expect(moment.isMoment(result[0].dateOfBirth)).toBe(true)
      expect(result[0].dateOfBirth.unix()).toBe(1577836800)
    })
  })

  describe('assignStatus', () => {
    const sut = resultService.assignStatus

    test('describes complete pupils with no status', () => {
      const pupil = {
        restartAvailable: false,
        currentCheckId: 1,
        checkComplete: true,
        mark: 25,
        attendanceReason: null
      }
      const status = sut(pupil)
      expect(status).toBe('')
    })

    test('describes incomplete pupils with an incomplete status', () => {
      const pupil = { restartAvailable: false, currentCheckId: 2, checkComplete: false }
      const status = sut(pupil)
      expect(status).toBe('Incomplete')
    })

    test('describes pupils who did not take a check', () => {
      const pupil = { restartAvailable: false, currentCheckId: null, checkComplete: false, attendanceId: false }
      const status = sut(pupil)
      expect(status).toBe('Incomplete')
    })

    test('describes pupils who are marked as not attending', () => {
      const pupil = {
        restartAvailable: false,
        currentCheckId: null,
        checkComplete: false,
        attendanceReason: 'any of the reasons for not attending'
      }
      const status = sut(pupil)
      expect(status).toBe('any of the reasons for not attending')
    })

    test('its shows a pupil as Incomplete if they don\'t have a mark (check has not been synchronised)', () => {
      const pupil = {
        restartAvailable: false,
        currentCheckId: 999,
        checkComplete: true,
        attendanceReason: null,
        complete: true,
        mark: null
      }
      const status = sut(pupil)
      expect(status).toBe('Incomplete')
    })

    test('it shows a pupil as Incomplete if they have never had a pin generated at all', () => {
      const pupil = {
        restartAvailable: false,
        currentCheckId: null,
        checkComplete: false,
        attendanceReason: null,
        complete: false,
        mark: null
      }
      const status = sut(pupil)
      expect(status).toBe('Incomplete')
    })
  })
}) // end result service
