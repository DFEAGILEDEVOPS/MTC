'use strict'
const uuid = require('uuid')

/* global describe, it, expect, spyOn fail test jest */
const sut = require('../../../services/school.service')
const schoolDataService = require('../../../services/data-access/school.data.service')
const schoolValidator = require('../../../lib/validator/school-validator')
const ValidationError = require('../../../lib/validation-error')

describe('school.service', () => {
  describe('findSchoolByDfeNumber', () => {
    it('should throw an error if school not found', async () => {
      const dfeNumber = '1234567'
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(undefined)
      try {
        await sut.findSchoolNameByDfeNumber(dfeNumber)
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toEqual(`School [${dfeNumber}] not found`)
      }
    })
    it('should return school name if found', async () => {
      const dfeNumber = '1234567'
      const schoolName = 'school1'
      const school = {
        id: 123,
        dfeNumber: dfeNumber,
        name: schoolName
      }
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve(school))
      const actual = await sut.findSchoolNameByDfeNumber(dfeNumber)
      expect(actual).toEqual(school.name)
    })
  })

  describe('findOneById', () => {
    it('should  throw an error if id not provided', async () => {
      try {
        await sut.findOneById()
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toEqual('id is required')
      }
    })
    it('returns school if found', async () => {
      const schoolName = 'school1'
      const school = {
        id: 123,
        name: schoolName
      }
      spyOn(schoolDataService, 'sqlFindOneById').and.returnValue(Promise.resolve(school))
      const actual = await sut.findOneById(123)
      expect(actual).toBe(school)
    })
  })

  describe('searchForSchool', () => {
    it('it throws if the query is empty string', async () => {
      try {
        await sut.searchForSchool('')
        fail()
      } catch (error) {
        expect(error.message).toBe('query is required')
      }
    })

    it('it throws if the query is undefined', async () => {
      try {
        await sut.searchForSchool(undefined)
        fail()
      } catch (error) {
        expect(error.message).toBe('query is required')
      }
    })

    it('it throws if the query is null', async () => {
      try {
        await sut.searchForSchool(null)
        fail()
      } catch (error) {
        expect(error.message).toBe('query is required')
      }
    })

    it('it throws if the query is not a number', async () => {
      try {
        await sut.searchForSchool('abc')
        fail()
      } catch (error) {
        expect(error.message).toBe('Invalid type: number required')
      }
    })

    it('returns undefined if the school is not found', async () => {
      spyOn(schoolDataService, 'sqlSearch').and.returnValue(Promise.resolve(undefined))
      const res = await sut.searchForSchool(1234)
      expect(res).toBeUndefined()
    })

    it('returns the school object if the school is found', async () => {
      spyOn(schoolDataService, 'sqlSearch').and.returnValue(Promise.resolve({ id: 1, name: 'test school' }))
      const res = await sut.searchForSchool(1234)
      expect(res).toStrictEqual({ id: 1, name: 'test school' })
    })
  })

  describe('findOneBySlug', () => {
    it('throws an error if the slug is an empty string', async () => {
      try {
        await sut.findOneBySlug('')
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing slug')
      }
    })

    it('throws an error if the slug is an empty string', async () => {
      try {
        await sut.findOneBySlug(undefined)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing slug')
      }
    })

    it('it returns undefined if the school is not found', async () => {
      spyOn(schoolDataService, 'sqlFindOneBySlug').and.returnValue(Promise.resolve(undefined))
      const res = await sut.findOneBySlug('abc')
      expect(res).toBeUndefined()
    })

    it('it returns the school when found', async () => {
      const school = {
        id: 123,
        name: 'test school 42'
      }
      spyOn(schoolDataService, 'sqlFindOneBySlug').and.returnValue(Promise.resolve(school))
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
      try {
        await sut.updateSchool(uuid.NIL, {})
        fail('expected to throw')
      } catch (error) {
        expect(error.name).toBe('ValidationError')
      }
    })
  })
})
