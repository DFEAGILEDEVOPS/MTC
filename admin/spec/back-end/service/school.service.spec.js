'use strict'

const uuid = require('uuid')
const sut = require('../../../services/school.service')
const schoolDataService = require('../../../services/data-access/school.data.service')
const schoolAuditDataService = require('../../../services/data-access/school-audit.data.service')
const schoolValidator = require('../../../lib/validator/school-validator')
const ValidationError = require('../../../lib/validation-error')
const auditOperationTypes = require('../../../lib/consts/audit-entry-types')
const { isArray } = require('ramda-adjunct')
const moment = require('moment-timezone')
const dateService = require('../../../services/date.service')

describe('school.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('findSchoolByDfeNumber', () => {
    test('should throw an error if school not found', async () => {
      const dfeNumber = '1234567'
      jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue(undefined)
      await expect(sut.findSchoolNameByDfeNumber(dfeNumber)).rejects.toThrow(`School [${dfeNumber}] not found`)
    })

    test('should return school name if found', async () => {
      const dfeNumber = '1234567'
      const schoolName = 'school1'
      const school = {
        id: 123,
        dfeNumber,
        name: schoolName
      }
      jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue(school)
      const actual = await sut.findSchoolNameByDfeNumber(dfeNumber)
      expect(actual).toEqual(school.name)
    })
  })

  describe('findOneById', () => {
    test('should  throw an error if id not provided', async () => {
      await expect(sut.findOneById()).rejects.toThrow('id is required')
    })

    test('returns school if found', async () => {
      const schoolName = 'school1'
      const school = {
        id: 123,
        name: schoolName
      }
      jest.spyOn(schoolDataService, 'sqlFindOneById').mockResolvedValue(school)
      const actual = await sut.findOneById(123)
      expect(actual).toBe(school)
    })
  })

  describe('searchForSchool', () => {
    test('it throws if the query is empty string', async () => {
      await expect(sut.searchForSchool('')).rejects.toThrow('query is required')
    })

    test('it throws if the query is undefined', async () => {
      await expect(sut.searchForSchool(undefined)).rejects.toThrow('query is required')
    })

    test('it throws if the query is null', async () => {
      await expect(sut.searchForSchool(null)).rejects.toThrow('query is required')
    })

    test('it throws if the query is not a number', async () => {
      await expect(sut.searchForSchool('abc')).rejects.toThrow('Invalid type: number required')
    })

    test('returns undefined if the school is not found', async () => {
      jest.spyOn(schoolDataService, 'sqlSearch').mockResolvedValue(undefined)
      const res = await sut.searchForSchool(1234)
      expect(res).toBeUndefined()
    })

    test('returns the school object if the school is found', async () => {
      jest.spyOn(schoolDataService, 'sqlSearch').mockResolvedValue({ id: 1, name: 'test school' })
      const res = await sut.searchForSchool(1234)
      expect(res).toStrictEqual({ id: 1, name: 'test school' })
    })
  })

  describe('findOneBySlug', () => {
    test('throws an error if the slug is an empty string', async () => {
      await expect(sut.findOneBySlug('')).rejects.toThrow('Missing slug')
    })

    test('it returns undefined if the school is not found', async () => {
      jest.spyOn(schoolDataService, 'sqlFindOneBySlug').mockResolvedValue(undefined)
      const res = await sut.findOneBySlug('abc')
      expect(res).toBeUndefined()
    })

    test('it returns the school when found', async () => {
      const school = {
        id: 123,
        name: 'test school 42'
      }
      jest.spyOn(schoolDataService, 'sqlFindOneBySlug').mockResolvedValue(school)
      const res = await sut.findOneBySlug('abc')
      expect(res).toStrictEqual(school)
    })
  })

  describe('updateSchool', () => {
    test('it throws if the slug is not provided', async () => {
      await expect(sut.updateSchool())
        .rejects
        .toThrow('Missing UUID')
    })

    test('it throws if the school ident is not a valid UUID', async () => {
      await expect(sut.updateSchool('invalid uuid'))
        .rejects
        .toThrow('Invalid UUID: invalid uuid')
    })

    test('it throws if the school update param is not provided', async () => {
      await expect(sut.updateSchool(uuid.NIL))
        .rejects
        .toThrow('Missing school details')
    })

    test('it throws if the userId is undefined', async () => {
      const slug = uuid.v4()
      const school = {}
      await expect(sut.updateSchool(slug, school))
        .rejects.toThrow('Missing userId')
    })

    test('it calls the data service to do the update if the validation passes', async () => {
      jest.spyOn(schoolDataService, 'sqlUpdateBySlug').mockImplementation(() => Promise.resolve({}))
      jest.spyOn(schoolValidator, 'validate').mockResolvedValue(new ValidationError())
      await sut.updateSchool(uuid.NIL, {}, 1)
      expect(schoolDataService.sqlUpdateBySlug).toHaveBeenCalledTimes(1)
    })

    test('it throws a ValidationError if the validation fails', async () => {
      const validationError = new ValidationError('dfeNumber', 'Test error')
      jest.spyOn(schoolValidator, 'validate').mockResolvedValue(validationError)
      await expect(sut.updateSchool(uuid.NIL, {}, 1))
        .rejects
        .toHaveProperty('name', 'ValidationError')
    })
  })

  describe('parseDfeNumber', () => {
    test('it returns the leaCode and the estabNumber', () => {
      const details = sut.parseDfeNumber(1234567)
      expect(details.leaCode).toBe(123)
      expect(details.estabCode).toBe(4567)
    })

    test('it throws if the dfe number is not a number', () => {
      expect(() => { sut.parseDfeNumber('1234567') }).toThrow(ValidationError)
    })

    test('it throws if the dfe number is undefined', () => {
      expect(() => { sut.parseDfeNumber('1234567') }).toThrow(ValidationError)
    })

    test('it throws if the dfe number is null', () => {
      expect(() => { sut.parseDfeNumber('1234567') }).toThrow(ValidationError)
    })

    test('it throws if the dfe number is only 6 digits', () => {
      expect(() => { sut.parseDfeNumber(999999) }).toThrow(ValidationError)
    })

    test('it throws if the dfe number is 8 digits', () => {
      expect(() => { sut.parseDfeNumber(10000000) }).toThrow(ValidationError)
    })

    test('it throws if the dfe number is an empty string', () => { // form submission
      expect(() => { sut.parseDfeNumber('') }).toThrow(ValidationError)
    })
  })

  describe('addSchool', () => {
    beforeEach(() => {
      jest.spyOn(schoolDataService, 'sqlAddSchool').mockImplementation()
      jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockReturnValue({ urlSlug: '00000000-00000000-00000000-00000000' })
    })

    test('it parses the dfeNumber to capture the leaCode and estabCode', async () => {
      jest.spyOn(schoolValidator, 'validate').mockResolvedValue(new ValidationError())
      await sut.addSchool({
        dfeNumber: 2011234,
        name: 'Test School',
        urn: 2
      })
      const insertData = schoolDataService.sqlAddSchool.mock.calls[0][0]
      expect(insertData.leaCode).toBe(201)
      expect(insertData.estabCode).toBe(1234)
    })

    test('it throws a validation error if the data fails the validator', async () => {
      jest.spyOn(schoolValidator, 'validate').mockRejectedValue(new ValidationError('urn', 'mock validation message'))
      expect.assertions(2)
      try {
        await sut.addSchool({ dfeNumber: 2011234, name: 'Test School', urn: 'fail', typeOfEstablishmentCode: 1 })
      } catch (error) {
        expect(error.constructor).toBe(ValidationError)
      }
      expect(schoolDataService.sqlAddSchool).not.toHaveBeenCalled()
    })

    test('it calls the data service if the validation passes', async () => {
      jest.spyOn(schoolValidator, 'validate').mockResolvedValue(new ValidationError())
      await sut.addSchool({ dfeNumber: 1234567, name: 'Test School', urn: 2, typeOfEstablishmentCode: 1 })
      expect(schoolDataService.sqlAddSchool).toHaveBeenCalledTimes(1)
    })

    test('it returns the details of the new school', async () => {
      jest.spyOn(schoolValidator, 'validate').mockResolvedValue(new ValidationError())
      const school = await sut.addSchool({ dfeNumber: 2011234, name: 'Test School', urn: 3, typeOfEstablishmentCode: 1 })
      expect(schoolDataService.sqlFindOneByDfeNumber).toHaveBeenCalled()
      expect(school.urlSlug).toEqual('00000000-00000000-00000000-00000000')
    })
  })

  describe('getSchoolAudits', () => {
    const createdAt = moment('2022-01-02 14:53:05')
    beforeEach(() => {
      jest.spyOn(schoolAuditDataService, 'getSummary').mockResolvedValue([{
        createdAt,
        auditOperation: auditOperationTypes.update,
        user: 'foo bar'
      }])
    })

    test('it should throw error if urlSlug is undefined', async () => {
      try {
        await sut.getSchoolAudits(undefined)
        fail('error should have been thrown')
      } catch (error) {
        expect(error.message).toBe('urlSlug is required')
      }
      expect(schoolAuditDataService.getSummary).not.toHaveBeenCalled()
    })

    test('it should return audit entries when urlSlug provided', async () => {
      const urlSlug = '5c4adea7-caea-4d4c-84d2-3e9fbb2db09c'
      const data = await sut.getSchoolAudits(urlSlug)
      expect(data).toBeDefined()
      expect(isArray(data)).toBe(true)
    })

    test('createdAt date should be formatted to short date', async () => {
      const urlSlug = '5c4adea7-caea-4d4c-84d2-3e9fbb2db09c'
      const data = await sut.getSchoolAudits(urlSlug)
      expect(data).toBeDefined()
      const expectedDateFormat = dateService.formatDateAndTime(createdAt)
      expect(data[0].createdAt).toStrictEqual(expectedDateFormat)
      expect(isArray(data)).toBe(true)
    })
  })

  describe('getAuditPayload', () => {
    const schoolData = {
      id: 1,
      name: 'my school'
    }
    const stringifiedSchoolData = JSON.stringify(schoolData)
    const payload = {
      newData: stringifiedSchoolData
    }
    beforeEach(() => {
      jest.spyOn(schoolAuditDataService, 'getAuditPayload').mockResolvedValue([payload])
    })

    test('it should throw error if auditEntryId is not provided', async () => {
      try {
        await sut.getAuditPayload(undefined)
        fail('error should have been thrown')
      } catch (error) {
        expect(error.message).toBe('auditEntryId is required')
      }
      expect(schoolAuditDataService.getAuditPayload).not.toHaveBeenCalled()
    })

    test('it should return payload when auditEntryId provided', async () => {
      const data = await sut.getAuditPayload(1)
      expect(data).toBeDefined()
      const expectedPayload = JSON.parse(stringifiedSchoolData)
      expect(data).toStrictEqual(expectedPayload)
    })
  })
})
