'use strict'

// const RA = require('ramda-adjunct')
// const moment = require('moment')

// const redisCacheService = require('../../lib/redis-cache.service')
// const resultService = require('./result.service')
// const logger = require('../../lib/logger')

import { ResultService } from './result.service'
import moment from 'moment'
import { IRawPupilResult, IResultDataService } from './data-access/result.data.service'

// const resultDataService = require('./data-access/result.data.service')

describe('result.service', () => {
  let sut: ResultService
  let mockResultDataService: IResultDataService

  const mockPupils: Array<IRawPupilResult> = [
    {
      lastName: 'Smith',
      foreName: 'Jack',
      dateOfBirth: moment('2012-01-01'),
      middleNames: 'Charlie',
      group_id: null,
      attendanceCode: null,
      attendanceReason: null,
      attendanceId: null,
      checkComplete: true,
      restartAvailable: false,
      currentCheckId: 1,
      mark: 1,
      pupilId: 1,
      school_id: 1,
      urlSlug: 'urlSlug'
    },
    {
      lastName: 'Smith',
      foreName: 'Jack',
      dateOfBirth: moment('2012-01-01'),
      middleNames: 'Bertie',
      group_id: null,
      attendanceCode: null,
      attendanceReason: null,
      attendanceId: null,
      checkComplete: true,
      restartAvailable: false,
      currentCheckId: 2,
      mark: 1,
      pupilId: 2,
      school_id: 1,
      urlSlug: 'urlSlug'
    },
    {
      lastName: 'Smith',
      foreName: 'Jack',
      dateOfBirth: moment('2012-01-01'),
      middleNames: 'Andy',
      group_id: null,
      attendanceCode: null,
      attendanceReason: null,
      attendanceId: null,
      checkComplete: true,
      restartAvailable: false,
      currentCheckId: 3,
      mark: 1,
      pupilId: 3,
      school_id: 1,
      urlSlug: 'urlSlug'
    }
  ]

  beforeEach(() => {
    mockResultDataService = {
      sqlFindPupilResultsForSchool: jest.fn().mockReturnValue(mockPupils)
    }
    sut = new ResultService(mockResultDataService)
  })

  describe('status', () => {
    test('it is defined', () => {
      expect(sut).toBeDefined()
    })

    test('it has a public `status` property', () => {
      expect(typeof sut.status).toBe('object')
    })

    test('calling status() returns an object that describes the pupils status\'s', () => {
      expect(sut.status).toHaveProperty('restartNotTaken')
      expect(sut.status).toHaveProperty('incomplete')
      expect(sut.status).toHaveProperty('didNotParticipate')
      expect(sut.status).toHaveProperty('complete')
    })
  })

  describe('sort', () => {
    test('it has a method called sort', () => {
      expect(typeof sut.sort).toBe('function')
    })

    test('sort calls `sortByProps` of the sortService', () => {
      const sortService = require('../../../common/table-sorting')
      const saved = sortService.sortByProps
      sortService.sortByProps = jest.fn()
      sut.sort([{
        foreName: 'fore',
        lastName: 'last',
        middleNames: '',
        group_id: null,
        dateOfBirth: moment().subtract(8.5, 'years'),
        score: null,
        status: '',
        urlSlug: 'aaa'
      }, {
        foreName: 'fore',
        lastName: 'last',
        middleNames: '',
        group_id: null,
        dateOfBirth: moment().subtract(8.5, 'years'),
        score: null,
        status: '',
        urlSlug: 'bbb'
      }])
      expect(sortService.sortByProps).toHaveBeenCalled()
      sortService.sortByProps = saved
    })
  })

  describe('getPupilResultDataFromDb', () => {
    const schoolId = 0

    test('returns an object', async () => {
      const res = await sut.getPupilResultDataFromDb(schoolId)
      expect(typeof res).toBe('object')
    })

    test('it has a generatedAt prop', async () => {
      const res = await sut.getPupilResultDataFromDb(schoolId)
      expect(moment.isMoment(res.generatedAt)).toBe(true)
    })

    test('it has a schoolId prop', async () => {
      const res = await sut.getPupilResultDataFromDb(schoolId)
      expect(res.schoolId).toBe(schoolId)
    })

    test('it sorts the pupils alphabetically', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: '' },
        { lastName: 'Talon', foreName: '' },
        { lastName: 'Anchovy', foreName: '' }
      ]

      mockResultDataService.sqlFindPupilResultsForSchool = jest.fn().mockReturnValue(mockResultData)

      const res = await sut.getPupilResultDataFromDb(schoolId)

      expect(res.pupils[0].lastName).toBe('Anchovy')
      expect(res.pupils[1].lastName).toBe('Smith')
      expect(res.pupils[2].lastName).toBe('Talon')
    })

    test('it sorts the pupils alphabetically - if the lastNames are the same it then sorts by foreName', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'Toad' },
        { lastName: 'Smith', foreName: 'Mario' },
        { lastName: 'Anchovy', foreName: 'Zeus' }
      ]

      mockResultDataService.sqlFindPupilResultsForSchool = jest.fn().mockReturnValue(mockResultData)

      const res = await sut.getPupilResultDataFromDb(schoolId)

      expect(res.pupils[0].lastName).toBe('Anchovy')
      expect(res.pupils[1]).toMatchObject({ lastName: 'Smith', foreName: 'Mario' })
      expect(res.pupils[2]).toMatchObject({ lastName: 'Smith', foreName: 'Toad' })
    })

    test('sorts the pupils alphabetically - if the lastname and forenames are the same it sorts by dob', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'John', dateOfBirth: moment('1970-01-01') },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2010-01-02') },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2010-01-01') }
      ]

      mockResultDataService.sqlFindPupilResultsForSchool = jest.fn().mockReturnValue(mockResultData)

      const res = await sut.getPupilResultDataFromDb(schoolId)

      expect(res.pupils[0]).toMatchObject({
        lastName: 'Smith',
        foreName: 'Jack',
        dateOfBirth: '1 Jan 2010'
      })
      expect(res.pupils[1]).toMatchObject({
        lastName: 'Smith',
        foreName: 'Jack',
        dateOfBirth: '2 Jan 2010'
      })
      expect(res.pupils[2]).toMatchObject({ lastName: 'Smith', foreName: 'John' })
    })

    test('sorts the pupils alphabetically - if the lastname, forename and dob are the same it sorts by middlenames', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2013-01-01'), middleNames: 'Zebra' },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2013-01-01'), middleNames: 'Xani' },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2013-01-01'), middleNames: 'Bea' }
      ]
      mockResultDataService.sqlFindPupilResultsForSchool = jest.fn().mockReturnValue(mockResultData)

      const res = await sut.getPupilResultDataFromDb(schoolId)

      expect(res.pupils[0].middleNames).toEqual('Bea')
      expect(res.pupils[1].middleNames).toEqual('Xani')
      expect(res.pupils[2].middleNames).toEqual('Zebra')
    })

    test('returns the pupil group_id', async () => {
      const mockResultData = [
        { foreName: 'Jack', middleNames: '', lastName: 'Smith', dateOfBirth: '', group_id: 42 }
      ]
      mockResultDataService.sqlFindPupilResultsForSchool = jest.fn().mockReturnValue(mockResultData)

      const res = await sut.getPupilResultDataFromDb(schoolId)

      expect(res.pupils[0].group_id).toBe(42)
    })

    test('returns the pupil full name', async () => {
      const mockResultData = [
        { foreName: 'Jack', middleNames: '', lastName: 'Smith', dateOfBirth: '', group_id: 42 }
      ]
      mockResultDataService.sqlFindPupilResultsForSchool = jest.fn().mockReturnValue(mockResultData)

      const res = await sut.getPupilResultDataFromDb(schoolId)

      expect(res.pupils[0].fullName).toBe('Smith, Jack')
    })

    test('returns the pupil full name with middle names if pupil differentiation requires a middleName sort', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'C' },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'B' },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'A' }
      ]
      mockResultDataService.sqlFindPupilResultsForSchool = jest.fn().mockReturnValue(mockResultData)

      const res = await sut.getPupilResultDataFromDb(schoolId)

      expect(res.pupils[0].fullName).toBe('Smith, Jack A')
      expect(res.pupils[1].fullName).toBe('Smith, Jack B')
      expect(res.pupils[2].fullName).toBe('Smith, Jack C')
    })

    it('returns a status field for each pupil', async () => {
      const mockResultData = [
        {
          lastName: 'Smith',
          foreName: 'Jack',
          dateOfBirth: moment('2012-01-01'),
          middleNames: 'C',
          currentCheckId: 1,
          checkComplete: true,
          attendanceReason: null,
          restartAvailable: false
        },
        {
          lastName: 'Testsuite',
          foreName: 'Jasmine',
          dateOfBirth: moment('2011-06-01'),
          middleNames: '',
          currentCheckId: null,
          checkComplete: false,
          attendanceReason: 'Not attending',
          restartAvailable: false
        },
        {
          lastName: 'Testsuite',
          foreName: 'Jasmine',
          dateOfBirth: moment('2011-06-01'),
          middleNames: '',
          currentCheckId: null,
          checkComplete: false,
          attendanceReason: '',
          restartAvailable: true
        }
      ]
      mockResultDataService.sqlFindPupilResultsForSchool = jest.fn().mockReturnValue(mockResultData)

      const res = await sut.getPupilResultDataFromDb(schoolId)
      res.pupils.forEach((result, i) => {
        expect(result.status).toBeDefined()
        expect(typeof result.status).toBe('string')
        if (i > 0) {
          // pupil[0] took the check so gets a valid correct status of '' - the empty string
          expect(result.status.length).toBeGreaterThan(0)
        }
      })
    })

    it('returns a score field for each pupil that took the check', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'C', mark: 5 },
        { lastName: 'Wall', foreName: 'Jane', dateOfBirth: moment('2012-07-01'), middleNames: '', mark: 8 },
        {
          lastName: 'Testsuite',
          foreName: 'Jasmine',
          dateOfBirth: moment('2011-06-01'),
          middleNames: '',
          currentCheckId: null,
          checkComplete: false,
          attendanceReason: '',
          restartAvailable: true
        }
      ]
      mockResultDataService.sqlFindPupilResultsForSchool = jest.fn().mockReturnValue(mockResultData)

      const res = await sut.getPupilResultDataFromDb(schoolId)

      expect(res.pupils[0].score).toBe(5) // Jack Smith #1
      expect(res.pupils[1].score).toBeUndefined() // Jane Wall #2
      expect(res.pupils[2].score).toBe(8) // Jasmine Testsuite #3 after sorting
    })
  })

  describe('cacheResultData', () => {
    it('calls redisCacheService get when school id is provided', async () => {
      spyOn(redisCacheService, 'get').and.returnValue('[{}]')
      const schoolId = 2
      try {
        await resultService.cacheResultData(schoolId, logger)
      } catch (error) {
        fail(error)
      }
      expect(redisCacheService.get).toHaveBeenCalled()
    })

    // it('throws an error if school id is not provided', async () => {
    //   spyOn(redisCacheService, 'get')
    //   const schoolId = undefined
    //   try {
    //     await resultService.cacheResultData(schoolId, logger)
    //     fail()
    //   } catch (error) {
    //     expect(error.message).toBe('school id not found')
    //   }
    //   expect(redisCacheService.get).not.toHaveBeenCalled()
    // })
    //
    // it('returns undefined if parsing the redis response fails', async () => {
    //   spyOn(redisCacheService, 'get')
    //   spyOn(resultDataService, 'sqlFindPupilResultsForSchool').and.returnValue([])
    //   const schoolId = 1
    //   let result
    //   try {
    //     result = await resultService.cacheResultData(schoolId, logger)
    //   } catch (error) {
    //     fail()
    //   }
    //   expect(result).toBeUndefined()
    // })

    // it('saves the result to redis if it queried the database', async () => {
    //   // setup
    //   const schoolId = 1
    //   spyOn(redisCacheService, 'get').and.returnValue(undefined) // initial cache miss from redis
    //   spyOn(redisCacheService, 'set') // spy on the write to redis
    //   const resultData = {
    //     generatedAt: moment('2020-06-03T11:23:45'),
    //     schoolId: schoolId,
    //     pupils: [
    //       { fullName: 'Smith, Jon', score: 10, status: '', group_id: 4, urlSlug: 'aaa' },
    //       { fullName: 'Everett, Katy', score: 9, status: '', group_id: 4, urlSlug: 'bbb' }
    //     ]
    //   }
    //   spyOn(resultService, 'getPupilResultDataFromDb').and.returnValue(resultData)
    //
    //   // exec
    //   await resultService.cacheResultData(schoolId, logger)
    //
    //   // test
    //   expect(resultService.getPupilResultDataFromDb).toHaveBeenCalledTimes(1)
    //   expect(redisCacheService.set).toHaveBeenCalledTimes(1)
    // })
  })

  describe('createPupilData', () => {
    // it('assigns a score to a pupil with a completed check', () => {
    //   const data = [
    //     { pupilId: 1, mark: 10, foreName: 'Joe', lastName: 'Test' }
    //   ]
    //   const result = resultService.createPupilData(data) // sut
    //   expect(RA.isArray(result)).toBe(true)
    // })
    //
    // it('returns the right shaped object', () => {
    //   const data = [
    //     {
    //       foreName: 'Jon',
    //       lastName: 'Programmer',
    //       middleNames: 'bbb',
    //       group_id: 12,
    //       dateOfBirth: moment.utc('2020-01-01'),
    //       mark: 9,
    //       foo: 'bar',
    //       urlSlug: 'aaa'
    //     }
    //   ]
    //   const result = resultService.createPupilData(data) // sut
    //   expect(result[0]).toEqual(jasmine.objectContaining({
    //     // dateOfBirth: '2020-01-01T00:00:00.000Z',
    //     foreName: 'Jon',
    //     group_id: 12,
    //     lastName: 'Programmer',
    //     middleNames: 'bbb',
    //     score: 9,
    //     status: 'Did not participate',
    //     urlSlug: 'aaa'
    //   }))
    //
    //   // Handle the dateOfBirth prop as a special case as moment objects are not equal even if they have the same date
    //   // It should be output as a moment object just the same as the input - passed through
    //   expect(moment.isMoment(result[0].dateOfBirth)).toBe(true)
    //   expect(result[0].dateOfBirth.unix()).toBe(1577836800) // > moment.utc('2020-01-01').unix() = 1577836800
    // })
  })

  // describe('assignStatus', () => {
  //   const sut = resultService.assignStatus
  //
  //   it('describes complete pupils with no status', () => {
  //     const pupil = { restartAvailable: false, currentCheckId: 1, checkComplete: true }
  //     const status = sut(pupil)
  //     expect(status).toBe('')
  //   })
  //
  //   it('describes incomplete pupils with an incomplete status', () => {
  //     const pupil = { restartAvailable: false, currentCheckId: 2, checkComplete: false }
  //     const status = sut(pupil)
  //     expect(status).toBe('Incomplete')
  //   })
  //
  //   it('describes pupils who did not take a check', () => {
  //     const pupil = { restartAvailable: false, currentCheckId: null, checkComplete: false, attendanceId: false }
  //     const status = sut(pupil)
  //     expect(status).toBe('Did not participate')
  //   })
  //
  //   it('describes pupils who are marked as not attending', () => {
  //     const pupil = {
  //       restartAvailable: false,
  //       currentCheckId: null,
  //       checkComplete: false,
  //       attendanceReason: 'any of the reasons for not attending'
  //     }
  //     const status = sut(pupil)
  //     expect(status).toBe('any of the reasons for not attending')
  //   })
  // })
}) // end result service
