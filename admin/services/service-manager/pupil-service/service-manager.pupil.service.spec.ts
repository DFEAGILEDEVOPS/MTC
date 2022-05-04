import { ServiceManagerPupilService } from './service-manager.pupil.service'
import { PupilSearchResult, ServiceManagerPupilDataService } from './service-manager.pupil.data.service'
const dateTimeService = require('../../date.service')

const validUpn = 'ThirteenChar5'

describe('service manager pupil service', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('findPupilByUpn', () => {
    test('error is thrown if upn is undefined', async () => {
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
        id: 123,
        urlSlug: 'urlSlug',
        foreName: 'forename',
        lastName: 'lastname',
        dateOfBirth: '2021-10-04 15:23',
        schoolName: 'school name',
        urn: 123456,
        dfeNumber: 4994494
      }
      jest.spyOn(ServiceManagerPupilDataService, 'findPupilByUpn').mockResolvedValue([expected])
      const actual = await ServiceManagerPupilService.findPupilByUpn(validUpn)
      expect(actual[0].dateOfBirth).toStrictEqual(dateTimeService.formatShortGdsDate(expected.dateOfBirth))
      expect(actual[0].dfeNumber).toStrictEqual(expected.dfeNumber)
      expect(actual[0].firstName).toStrictEqual(expected.foreName)
      expect(actual[0].lastName).toStrictEqual(expected.lastName)
      expect(actual[0].schoolName).toStrictEqual(expected.schoolName)
      expect(actual[0].urlSlug).toStrictEqual(expected.urlSlug)
      expect(actual[0].id).toStrictEqual(expected.id)
    })
  })

  describe('getPupilByUrlSlug', () => {
    test('validates the url slug as uuid', async () => {
      const invalidUuid = 'invalid-uuid-value'
      await expect(ServiceManagerPupilService.getPupilByUrlSlug(invalidUuid)).rejects.toThrow(`${invalidUuid} is not a valid UUID`)
    })

    test('returns undefined if nothing found', async () => {
      jest.spyOn(ServiceManagerPupilDataService, 'getPupilByUrlSlug').mockResolvedValue([])
      await expect(ServiceManagerPupilService.getPupilByUrlSlug('455cc6b4-a688-469a-ab72-9c7e137a1ea8'))
        .resolves.toBeUndefined()
    })

    test('maps raw data to return object', async () => {
      const expected: PupilSearchResult = {
        id: 123,
        urlSlug: 'urlSlug',
        foreName: 'forename',
        lastName: 'lastname',
        dateOfBirth: '2021-10-04 15:23',
        schoolName: 'school name',
        urn: 123456,
        dfeNumber: 4994494
      }
      jest.spyOn(ServiceManagerPupilDataService, 'getPupilByUrlSlug').mockResolvedValue([expected])
      const actual = await ServiceManagerPupilService.getPupilByUrlSlug('455cc6b4-a688-469a-ab72-9c7e137a1ea8')
      expect(actual.dateOfBirth).toStrictEqual(dateTimeService.formatShortGdsDate(expected.dateOfBirth))
      expect(actual.dfeNumber).toStrictEqual(expected.dfeNumber)
      expect(actual.firstName).toStrictEqual(expected.foreName)
      expect(actual.lastName).toStrictEqual(expected.lastName)
      expect(actual.schoolName).toStrictEqual(expected.schoolName)
      expect(actual.urlSlug).toStrictEqual(expected.urlSlug)
      expect(actual.id).toStrictEqual(expected.id)
    })
  })
})
