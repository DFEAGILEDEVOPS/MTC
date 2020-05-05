'use strict'

/* global describe, it, expect, spyOn fail */
const sut = require('../../../services/school.service')
const schoolDataService = require('../../../services/data-access/school.data.service')

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
  describe('findSchoolById', () => {
    it('should  throw an error if id not provided', async () => {
      try {
        await sut.findSchoolById()
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
      const actual = await sut.findSchoolById(123)
      expect(actual).toBe(school)
    })
  })
})
