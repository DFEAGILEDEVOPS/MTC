import { ServiceManagerPupilService, ServiceManagerPupilDetails } from './service-manager.pupil.service'
import { PupilSearchResult, PupilStatusData, ServiceManagerPupilDataService } from './service-manager.pupil.data.service'
import moment from 'moment-timezone'
import redisCacheService from '../../../services/data-access/redis-cache.service'
import { ServiceManagerSchoolResult } from '../school/school.data.service'
const settingService = require('../../setting.service')
const dateService = require('../../date.service')

const validUpn = 'ThirteenChar5'
const sut = ServiceManagerPupilService

describe('service manager pupil service', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('findPupilByUpn', () => {
    test('error is thrown if upn is undefined', async () => {
      // @ts-ignore:next-line assert if undefined handled correctly at runtime
      await expect(ServiceManagerPupilService.findPupilByUpn(undefined)).rejects.toThrow('upn is required')
    })
    test('error is thrown if upn is empty string', async () => {
      await expect(ServiceManagerPupilService.findPupilByUpn('')).rejects.toThrow('upn is required')
    })
    test('error is thrown if upn is not 13 chars in length', async () => {
      await expect(ServiceManagerPupilService.findPupilByUpn('twelvecharss')).rejects.toThrow('upn should be 13 characters and numbers')
    })
    test('error is thrown if upn contains non alphanumeric characters', async () => {
      await expect(ServiceManagerPupilService.findPupilByUpn('this-is-badd&')).rejects.toThrow('upn should only contain alphanumeric characters')
    })
    test('passes validation if no issues with input', async () => {
      jest.spyOn(ServiceManagerPupilDataService, 'findPupilByUpn').mockImplementation()
      await ServiceManagerPupilService.findPupilByUpn(validUpn)
      expect(ServiceManagerPupilDataService.findPupilByUpn).toHaveBeenCalledTimes(1)
    })

    test('forces uppercase of UPN entry', async () => {
      jest.spyOn(ServiceManagerPupilDataService, 'findPupilByUpn').mockImplementation()
      await ServiceManagerPupilService.findPupilByUpn(validUpn.toLowerCase())
      expect(ServiceManagerPupilDataService.findPupilByUpn).toHaveBeenCalledWith(validUpn.toUpperCase())
    })

    test('maps raw data result correctly into search result', async () => {
      const expected: PupilSearchResult = {
        createdAt: moment('2022-01-30T15:24:24'),
        id: 123,
        urlSlug: 'urlSlug',
        foreName: 'forename',
        lastName: 'lastname',
        middleNames: 'middle names',
        dateOfBirth: moment('2021-10-04T15:23'),
        schoolName: 'school name',
        urn: 123456,
        dfeNumber: 4994494,
        upn: 'N999199900001',
        schoolId: 123,
        attendanceCode: 'ABC',
        frozen: false
      }
      jest.spyOn(ServiceManagerPupilDataService, 'findPupilByUpn').mockResolvedValue([expected])
      const actual = await ServiceManagerPupilService.findPupilByUpn(validUpn)
      expect(actual[0].dateOfBirth).toStrictEqual(dateService.formatShortGdsDate(expected.dateOfBirth))
      expect(actual[0].dfeNumber).toStrictEqual(expected.dfeNumber)
      expect(actual[0].firstName).toStrictEqual(expected.foreName)
      expect(actual[0].lastName).toStrictEqual(expected.lastName)
      expect(actual[0].middleNames).toStrictEqual(expected.middleNames)
      expect(actual[0].schoolName).toStrictEqual(expected.schoolName)
      expect(actual[0].urlSlug).toStrictEqual(expected.urlSlug)
      expect(actual[0].id).toStrictEqual(expected.id)
      expect(actual[0].upn).toStrictEqual(expected.upn)
      expect(actual[0].schoolId).toStrictEqual(expected.schoolId)
      expect(actual[0].createdAt).toStrictEqual(dateService.formatShortGdsDate(expected.createdAt))
    })
  })

  describe('getPupilDetailsByUrlSlug', () => {
    let mockPupilDetailsData: PupilStatusData
    beforeEach(() => {
      mockPupilDetailsData = {
        id: 3,
        foreName: 'Davenport',
        lastName: 'Mendoza',
        middleNames: 'Yellow',
        dateOfBirth: moment('2012-09-05T00:00:00Z'),
        group_id: null,
        urlSlug: 'FC34AD5D-3A44-448B-8EA1-24C0D7A3EB24',
        school_id: 2,
        reason: null,
        reasonCode: null,
        attendanceId: null,
        pupilCheckComplete: false,
        currentCheckId: null,
        pupilId: 3,
        restartAvailable: false,
        checkReceived: null,
        checkComplete: null,
        processingFailed: null,
        pupilLoginDate: null,
        pinExpiresAt: null
      }
      jest.spyOn(ServiceManagerPupilDataService, 'getPupilStatusData').mockResolvedValue([mockPupilDetailsData])
      jest.spyOn(settingService, 'get').mockResolvedValue(
        {
          loadingTimeLimit: 3,
          questionTimeLimit: 6,
          checkTimeLimit: 30
        })
    })

    test('validates the url slug as uuid', async () => {
      const invalidUuid = 'invalid-uuid-value'
      await expect(ServiceManagerPupilService.getPupilDetailsByUrlSlug(invalidUuid)).rejects.toThrow(`${invalidUuid} is not a valid UUID`)
    })

    test('throws error if nothing found', async () => {
      jest.spyOn(ServiceManagerPupilDataService, 'getPupilByUrlSlug').mockResolvedValue([])
      await expect(ServiceManagerPupilService.getPupilDetailsByUrlSlug('455cc6b4-a688-469a-ab72-9c7e137a1ea8'))
        .rejects.toThrow('no pupil found with specified urlSlug')
    })

    test('maps raw data to return object', async () => {
      const expected: PupilSearchResult = {
        createdAt: moment('2022-01-30T15:24:24'),
        id: 123,
        urlSlug: 'urlSlug',
        foreName: 'forename',
        lastName: 'lastname',
        middleNames: 'middle names',
        dateOfBirth: moment('2021-10-04T15:23'),
        schoolName: 'school name',
        urn: 123456,
        dfeNumber: 4994494,
        upn: 'N999199900001',
        schoolId: 456,
        attendanceCode: 'EDFG',
        frozen: false
      }
      jest.spyOn(ServiceManagerPupilDataService, 'getPupilByUrlSlug').mockResolvedValue([expected])
      const actual = await ServiceManagerPupilService.getPupilDetailsByUrlSlug('455cc6b4-a688-469a-ab72-9c7e137a1ea8')
      expect(actual.dateOfBirth).toStrictEqual(dateService.formatShortGdsDate(expected.dateOfBirth))
      expect(actual.dfeNumber).toStrictEqual(expected.dfeNumber)
      expect(actual.firstName).toStrictEqual(expected.foreName)
      expect(actual.lastName).toStrictEqual(expected.lastName)
      expect(actual.schoolName).toStrictEqual(expected.schoolName)
      expect(actual.urlSlug).toStrictEqual(expected.urlSlug)
      expect(actual.id).toStrictEqual(expected.id)
      expect(actual.upn).toStrictEqual(expected.upn)
      expect(actual.schoolId).toStrictEqual(expected.schoolId)
      expect(actual.isFrozen).toBe(false)
    })

    test('should return valid status when pupil found', async () => {
      const expected: PupilSearchResult = {
        createdAt: moment('2022-01-30T15:24:24'),
        id: 123,
        urlSlug: 'urlSlug',
        foreName: 'forename',
        lastName: 'lastname',
        middleNames: 'middle names',
        dateOfBirth: moment('2021-10-04T15:23'),
        schoolName: 'school name',
        urn: 123456,
        dfeNumber: 4994494,
        upn: 'N999199900001',
        schoolId: 45656,
        attendanceCode: 'BEUF',
        frozen: false
      }
      jest.spyOn(ServiceManagerPupilDataService, 'getPupilByUrlSlug').mockResolvedValue([expected])
      const pupilDetails = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(mockPupilDetailsData.urlSlug)
      expect(pupilDetails.status).toBe('Not started')
    })
  })

  describe('movePupilToSchool', () => {
    const pupil: ServiceManagerPupilDetails = {
      dateOfBirth: '1 April 2013',
      dfeNumber: 1234567,
      firstName: 'firstname',
      id: 1,
      isAnnulled: false,
      lastName: 'Lastname',
      middleNames: 'Middle Names',
      schoolId: 2,
      schoolName: 'School Name',
      schoolUrn: 777111,
      status: 'Not Started',
      upn: 'G10000000',
      urlSlug: 'slug',
      isFrozen: false
    }
    const school: ServiceManagerSchoolResult = {
      id: 100,
      leaCode: 999,
      estabCode: 100,
      name: 'Example School',
      urlSlug: 'slug',
      urn: 891000,
      dfeNumber: 999100
    }

    let redisCacheDropSpy: jest.SpyInstance

    beforeEach(() => {
      redisCacheDropSpy = jest.spyOn(redisCacheService, 'drop').mockImplementation()
      jest.spyOn(ServiceManagerPupilDataService, 'sqlMovePupilToSchool').mockImplementation()
    })

    test('it checks that the pupil param is defined', async () => {
      // @ts-ignore passing undef instead of object for pupil param
      await expect(sut.movePupilToSchool()).rejects.toThrow('Missing pupil')
    })

    test('it checks that the school param is defined', async () => {
      // @ts-ignore passing undef instead of object for school param
      await expect(sut.movePupilToSchool(pupil)).rejects.toThrow('Missing school')
    })

    test('it checks that the userId param is defined', async () => {
      // @ts-ignore passing undef instead of number for userId param
      await expect(sut.movePupilToSchool(pupil, school)).rejects.toThrow('Missing user ID')
    })

    test('it calls the data serice to move the pupil', async () => {
      const userId = 99
      await sut.movePupilToSchool(pupil, school, userId)
      expect(ServiceManagerPupilDataService.sqlMovePupilToSchool).toHaveBeenCalledWith(1, 100, 99)
    })

    test('it drops items from the cache that might be outdated', async () => {
      const userId = 99
      await sut.movePupilToSchool(pupil, school, userId)
      expect(redisCacheDropSpy).toHaveBeenCalledTimes(1)
      const cacheDropArgs = redisCacheDropSpy.mock.calls[0]
      expect(cacheDropArgs[0]).toHaveLength(4) // array of keys to drop
    })
  })
})
