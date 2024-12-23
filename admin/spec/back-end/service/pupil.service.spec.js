'use strict'

const R = require('ramda')
const sut = require('../../../services/pupil.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')
const sorting = require('../../../helpers/table-sorting')

describe('pupil service', () => {
  const getPupil = () => R.assoc('school', R.clone(schoolMock), pupilMock)

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#fetchOnePupil', () => {
    test('it makes a call to the pupilDataService', async () => {
      jest.spyOn(pupilDataService, 'sqlFindOneByIdAndSchool').mockResolvedValue(getPupil())
      await sut.fetchOnePupil('arg1', 'arg2')
      expect(pupilDataService.sqlFindOneByIdAndSchool).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })

  describe('#fetchOnePupilBySlug', () => {
    const schoolId = 1
    test('it makes a call to the pupilDataService', async () => {
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').mockResolvedValue(getPupil())
      await sut.fetchOnePupilBySlug('slug', schoolId)
      expect(pupilDataService.sqlFindOneBySlugAndSchool).toHaveBeenCalledWith('slug', schoolId)
    })
  })

  describe('#getPupilsWithFullNames', () => {
    test('it returns a sorted object with combined name values and urlSlug', async () => {
      const pupilMocks = [
        { foreName: 'John', middleNames: 'Test', lastName: 'Johnson', urlSlug: 'AA-12345' },
        { foreName: 'John2', middleNames: '', lastName: 'Johnson2', urlSlug: 'BB-12345' }
      ]
      jest.spyOn(pupilDataService, 'sqlFindPupilsBySchoolId').mockResolvedValue(pupilMocks)
      jest.spyOn(sorting, 'sortByProps').mockReturnValue(pupilMocks)
      const pupils = await sut.getPupilsWithFullNames(1234567)
      expect(sorting.sortByProps).toHaveBeenCalled()
      expect(pupils[0].fullName).toBe('Johnson John Test')
      expect(pupils[1].fullName).toBe('Johnson2 John2')
      expect(pupils[0].urlSlug).toBe('AA-12345')
      expect(pupils.length).toBe(2)
    })
    test('it throws an error when schoolId is not provided', async () => {
      jest.spyOn(pupilDataService, 'sqlFindPupilsBySchoolId').mockImplementation()
      await expect(sut.getPupilsWithFullNames()).rejects.toThrow('schoolId is required')
      expect(pupilDataService.sqlFindPupilsBySchoolId).not.toHaveBeenCalled()
    })
  })

  describe('#findPupilsBySchoolId', () => {
    test('sorts the pupils before returning them', async () => {
      const pupilMocks = [
        { foreName: 'John', middleNames: 'Test', lastName: 'Johnson', urlSlug: 'AA-12345' },
        { foreName: 'John2', middleNames: '', lastName: 'Johnson2', urlSlug: 'BB-12345' }
      ]
      jest.spyOn(pupilDataService, 'sqlFindPupilsBySchoolId').mockResolvedValue(pupilMocks)
      jest.spyOn(sorting, 'sortByProps').mockImplementation()
      await sut.findPupilsBySchoolId(1)
      expect(sorting.sortByProps).toHaveBeenCalled()
    })
    test('it throws an error when schoolId is not provided', async () => {
      jest.spyOn(pupilDataService, 'sqlFindPupilsBySchoolId').mockImplementation()
      await expect(sut.findPupilsBySchoolId()).rejects.toThrow('schoolId is required')
      expect(pupilDataService.sqlFindPupilsBySchoolId).not.toHaveBeenCalled()
    })
  })

  describe('#findOneBySlugAndSchool', () => {
    test('it throws an error when schoolId is not provided', async () => {
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').mockImplementation()
      await expect(sut.findOneBySlugAndSchool()).rejects.toThrow('schoolId is required')
      expect(pupilDataService.sqlFindOneBySlugAndSchool).not.toHaveBeenCalled()
    })
  })
})
