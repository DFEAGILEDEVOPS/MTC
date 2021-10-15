'use strict'
const uuid = require('uuid')

/* global describe, expect test jest afterEach */
const sut = require('../../../services/school.service')
const schoolDataService = require('../../../services/data-access/school.data.service')
const schoolValidator = require('../../../lib/validator/school-validator')
const ValidationError = require('../../../lib/validation-error')

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
        dfeNumber: dfeNumber,
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

    test('it calls the data service to do the update if the validation passes', async () => {
      jest.spyOn(schoolDataService, 'sqlUpdateBySlug').mockImplementation(_ => Promise.resolve({}))
      jest.spyOn(schoolValidator, 'validate').mockResolvedValue(new ValidationError())
      await sut.updateSchool(uuid.NIL, {})
      expect(schoolDataService.sqlUpdateBySlug).toHaveBeenCalledTimes(1)
    })

    test('it throws a ValidationError if the validation fails', async () => {
      const validationError = new ValidationError('dfeNumber', 'Test error')
      jest.spyOn(schoolValidator, 'validate').mockResolvedValue(validationError)
      await expect(sut.updateSchool(uuid.NIL, {}))
        .rejects
        .toHaveProperty('name', 'ValidationError')
    })
  })
})
