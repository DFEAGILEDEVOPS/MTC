import moment from 'moment'
import * as RA from 'ramda-adjunct'

import { ConsoleLogger } from '../../../common/logger'
import { IRawPupilResult, IResultDataService } from './data-access/result.data.service'
import { IRedisService } from '../../../caching/redis-service'
import { RedisServiceMock } from '../../../caching/redis-service.mock'
import { ResultService } from './result.service'

describe('result.service', () => {
  let sut: ResultService
  let mockResultDataService: IResultDataService
  let mockRedisService: IRedisService
  const mockPupils: IRawPupilResult[] = [
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
      sqlFindPupilResultsForSchool: jest.fn().mockReturnValue(mockPupils),
      sqlFindSchool: jest.fn().mockReturnValue({ id: 1, name: 'Example School', timezone: null })
    }
    mockRedisService = new RedisServiceMock()
    const consoleLogger = new ConsoleLogger()
    sut = new ResultService(consoleLogger, mockResultDataService, mockRedisService)
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
  })

  describe('getPupilResultDataFromDb', () => {
    const schoolGuid = 'aaa-bbb-ccc-ddd'

    test('returns an object', async () => {
      const res = await sut.getPupilResultDataFromDb(schoolGuid)
      expect(typeof res).toBe('object')
    })

    test('it has a generatedAt prop', async () => {
      const res = await sut.getPupilResultDataFromDb(schoolGuid)
      expect(moment.isMoment(res.generatedAt)).toBe(true)
    })

    test('it has a schoolGuid prop', async () => {
      const res = await sut.getPupilResultDataFromDb(schoolGuid)
      expect(res.schoolId).toBeDefined()
    })

    test('it throws an error if the school is not found', async () => {
      mockResultDataService.sqlFindSchool = jest.fn().mockReturnValue(undefined)
      try {
        await sut.getPupilResultDataFromDb('a fake guid')
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Unable to find school with Guid a fake guid')
      }
    })

    test('it sorts the pupils alphabetically', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: '' },
        { lastName: 'Talon', foreName: '' },
        { lastName: 'Anchovy', foreName: '' }
      ]

      mockResultDataService.sqlFindPupilResultsForSchool = jest.fn().mockReturnValue(mockResultData)

      const res = await sut.getPupilResultDataFromDb(schoolGuid)

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

      const res = await sut.getPupilResultDataFromDb(schoolGuid)

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

      const res = await sut.getPupilResultDataFromDb(schoolGuid)

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

      const res = await sut.getPupilResultDataFromDb(schoolGuid)

      expect(res.pupils[0].middleNames).toEqual('Bea')
      expect(res.pupils[1].middleNames).toEqual('Xani')
      expect(res.pupils[2].middleNames).toEqual('Zebra')
    })

    test('returns the pupil group_id', async () => {
      const mockResultData = [
        { foreName: 'Jack', middleNames: '', lastName: 'Smith', dateOfBirth: '', group_id: 42 }
      ]
      mockResultDataService.sqlFindPupilResultsForSchool = jest.fn().mockReturnValue(mockResultData)

      const res = await sut.getPupilResultDataFromDb(schoolGuid)

      expect(res.pupils[0].group_id).toBe(42)
    })

    test('returns the pupil full name', async () => {
      const mockResultData = [
        { foreName: 'Jack', middleNames: '', lastName: 'Smith', dateOfBirth: '', group_id: 42 }
      ]
      mockResultDataService.sqlFindPupilResultsForSchool = jest.fn().mockReturnValue(mockResultData)

      const res = await sut.getPupilResultDataFromDb(schoolGuid)

      expect(res.pupils[0].fullName).toBe('Smith, Jack')
    })

    test('returns the pupil full name with middle names if pupil differentiation requires a middleName sort', async () => {
      const mockResultData = [
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'C' },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'B' },
        { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'A' }
      ]
      mockResultDataService.sqlFindPupilResultsForSchool = jest.fn().mockReturnValue(mockResultData)

      const res = await sut.getPupilResultDataFromDb(schoolGuid)

      expect(res.pupils[0].fullName).toBe('Smith, Jack A')
      expect(res.pupils[1].fullName).toBe('Smith, Jack B')
      expect(res.pupils[2].fullName).toBe('Smith, Jack C')
    })

    test('it returns a status field for each pupil', async () => {
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

      const res = await sut.getPupilResultDataFromDb(schoolGuid)
      res.pupils.forEach((result, i) => {
        expect(result.status).toBeDefined()
        expect(typeof result.status).toBe('string')
        if (i > 0) {
          // pupil[0] took the check so gets a valid correct status of '' - the empty string
          expect(result.status.length).toBeGreaterThan(0)
        }
      })
    })

    test('it returns a score field for each pupil that took the check', async () => {
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

      const res = await sut.getPupilResultDataFromDb(schoolGuid)

      expect(res.pupils[0].score).toBe(5) // Jack Smith #1
      expect(res.pupils[1].score).toBeUndefined() // Jane Wall #2
      expect(res.pupils[2].score).toBe(8) // Jasmine Testsuite #3 after sorting
    })
  })

  describe('cacheResultData', () => {
    test('it throws an error if schoolGuid is not provided', async () => {
      const schoolGuid = undefined
      try {
        await sut.cacheResultData(schoolGuid)
        fail()
      } catch (error) {
        expect(error.message).toBe('schoolGuid not found')
      }
      expect(mockRedisService.setex).not.toHaveBeenCalled()
    })

    test('it saves the result to redis if it queried the database', async () => {
      // setup
      const schoolGuid = 'aaa'

      // exec
      await sut.cacheResultData(schoolGuid)

      // test
      expect(mockResultDataService.sqlFindPupilResultsForSchool).toHaveBeenCalledTimes(1)
      expect(mockRedisService.setex).toHaveBeenCalledTimes(1)
    })
  })

  describe('createPupilData', () => {
    test('it assigns a score to a pupil with a completed check', () => {
      const data = [
        {
          pupilId: 1,
          mark: 10,
          foreName: 'Joe',
          lastName: 'Test',
          middleNames: '',
          attendanceCode: null,
          attendanceId: null,
          attendanceReason: null,
          currentCheckId: 1,
          checkComplete: true,
          group_id: null,
          dateOfBirth: moment().subtract(8.2, 'years'),
          restartAvailable: false,
          school_id: 1,
          urlSlug: 'aaa-bbb'
        }
      ]
      const result = sut.createPupilData(data)
      expect(RA.isArray(result)).toBe(true)
    })
  })

  describe('assignStatus', () => {
    test('it describes complete pupils with no status', () => {
      const pupil = {
        pupilId: 1,
        mark: 10,
        foreName: 'Joe',
        lastName: 'Test',
        middleNames: '',
        attendanceCode: null,
        attendanceId: null,
        attendanceReason: null,
        currentCheckId: 1,
        checkComplete: true,
        group_id: null,
        dateOfBirth: moment().subtract(8.2, 'years'),
        restartAvailable: false,
        school_id: 1,
        urlSlug: 'aaa-bbb'
      }
      const status = sut.assignStatus(pupil)
      expect(status).toBe('')
    })

    test('it describes incomplete pupils with an incomplete status', () => {
      const pupil = {
        pupilId: 1,
        mark: 10,
        foreName: 'Joe',
        lastName: 'Test',
        middleNames: '',
        attendanceCode: null,
        attendanceId: null,
        attendanceReason: null,
        currentCheckId: 2,
        checkComplete: false,
        group_id: null,
        dateOfBirth: moment().subtract(8.2, 'years'),
        restartAvailable: false,
        school_id: 1,
        urlSlug: 'aaa-bbb'
      }
      const status = sut.assignStatus(pupil)
      expect(status).toBe('Incomplete')
    })

    test('it describes pupils who did not take a check', () => {
      const pupil = {
        pupilId: 1,
        mark: 10,
        foreName: 'Joe',
        lastName: 'Test',
        middleNames: '',
        attendanceCode: null,
        attendanceId: null,
        attendanceReason: null,
        currentCheckId: null,
        checkComplete: false,
        group_id: null,
        dateOfBirth: moment().subtract(8.2, 'years'),
        restartAvailable: false,
        school_id: 1,
        urlSlug: 'aaa-bbb'
      }
      const status = sut.assignStatus(pupil)
      expect(status).toBe('Did not participate')
    })

    test('it describes pupils who are marked as not attending', () => {
      const pupil = {
        pupilId: 1,
        mark: 10,
        foreName: 'Joe',
        lastName: 'Test',
        middleNames: '',
        attendanceCode: null,
        attendanceId: 4,
        attendanceReason: 'any of the reasons for not attending',
        currentCheckId: null,
        checkComplete: false,
        group_id: null,
        dateOfBirth: moment().subtract(8.2, 'years'),
        restartAvailable: false,
        school_id: 1,
        urlSlug: 'aaa-bbb'
      }
      const status = sut.assignStatus(pupil)
      expect(status).toBe('any of the reasons for not attending')
    })
  })
}) // end result service
