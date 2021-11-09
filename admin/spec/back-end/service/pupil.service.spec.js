'use strict'

const R = require('ramda')
const sut = require('../../../services/pupil.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')
const sorting = require('../../../helpers/table-sorting')

/* global describe, it, expect, spyOn, fail */

describe('pupil service', () => {
  const getPupil = () => R.assoc('school', R.clone(schoolMock), pupilMock)

  const pupilMockPromise = () => {
    return Promise.resolve(getPupil())
  }

  describe('#fetchOnePupil', () => {
    it('it makes a call to the pupilDataService', async () => {
      spyOn(pupilDataService, 'sqlFindOneByIdAndSchool').and.returnValue(pupilMockPromise())
      await sut.fetchOnePupil('arg1', 'arg2')
      expect(pupilDataService.sqlFindOneByIdAndSchool).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })

  describe('#fetchOnePupilBySlug', () => {
    const schoolId = 1
    it('it makes a call to the pupilDataService', async () => {
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue(pupilMockPromise())
      await sut.fetchOnePupilBySlug('slug', schoolId)
      expect(pupilDataService.sqlFindOneBySlugAndSchool).toHaveBeenCalledWith('slug', schoolId)
    })
  })

  describe('#getPupilsWithFullNames', () => {
    it('it returns a sorted object with combined name values and urlSlug', async () => {
      const pupilMocks = [
        { foreName: 'John', middleNames: 'Test', lastName: 'Johnson', urlSlug: 'AA-12345' },
        { foreName: 'John2', middleNames: '', lastName: 'Johnson2', urlSlug: 'BB-12345' }
      ]
      spyOn(pupilDataService, 'sqlFindPupilsBySchoolId').and.returnValue(pupilMocks)
      spyOn(sorting, 'sortByProps').and.returnValue(pupilMocks)
      let pupils
      try {
        pupils = await sut.getPupilsWithFullNames(1234567)
      } catch (error) {
        fail()
      }
      expect(sorting.sortByProps).toHaveBeenCalled()
      expect(pupils[0].fullName).toBe('Johnson John Test')
      expect(pupils[1].fullName).toBe('Johnson2 John2')
      expect(pupils[0].urlSlug).toBe('AA-12345')
      expect(pupils.length).toBe(2)
    })
    it('it throws an error when schoolId is not provided', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsBySchoolId')
      try {
        await sut.getPupilsWithFullNames()
        fail()
      } catch (error) {
        expect(error.message).toBe('schoolId is required')
      }
      expect(pupilDataService.sqlFindPupilsBySchoolId).not.toHaveBeenCalled()
    })
  })

  describe('#findPupilsBySchoolId', () => {
    it('sorts the pupils before returning them', async () => {
      const pupilMocks = [
        { foreName: 'John', middleNames: 'Test', lastName: 'Johnson', urlSlug: 'AA-12345' },
        { foreName: 'John2', middleNames: '', lastName: 'Johnson2', urlSlug: 'BB-12345' }
      ]
      spyOn(pupilDataService, 'sqlFindPupilsBySchoolId').and.returnValue(pupilMocks)
      spyOn(sorting, 'sortByProps')
      try {
        await sut.findPupilsBySchoolId(1)
        expect(sorting.sortByProps).toHaveBeenCalled()
      } catch (error) {
        fail(error.message)
      }
    })
    it('it throws an error when schoolId is not provided', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsBySchoolId')
      try {
        await sut.findPupilsBySchoolId()
        fail()
      } catch (error) {
        expect(error.message).toBe('schoolId is required')
      }
      expect(pupilDataService.sqlFindPupilsBySchoolId).not.toHaveBeenCalled()
    })
  })

  describe('#findOneBySlugAndSchool', () => {
    it('it throws an error when schoolId is not provided', async () => {
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool')
      try {
        await sut.findOneBySlugAndSchool()
        fail()
      } catch (error) {
        expect(error.message).toBe('schoolId is required')
      }
      expect(pupilDataService.sqlFindOneBySlugAndSchool).not.toHaveBeenCalled()
    })
  })
})
