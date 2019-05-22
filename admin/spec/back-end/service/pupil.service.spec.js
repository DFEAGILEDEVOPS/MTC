'use strict'

const R = require('ramda')
const proxyquire = require('proxyquire').noCallThru()
const pupilService = require('../../../services/pupil.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')
const schoolDataService = require('../../../services/data-access/school.data.service')

/* global describe, it, expect, spyOn, fail */

describe('pupil service', () => {
  const getPupil = () => R.assoc('school', R.clone(schoolMock), pupilMock)

  const pupilMockPromise = () => {
    return Promise.resolve(getPupil())
  }

  function setupService (pupilDataService) {
    return proxyquire('../../../services/pupil.service', {
      './data-access/pupil.data.service': pupilDataService
    })
  }

  describe('#fetchOnePupil', () => {
    it('it makes a call to the pupilDataService', async () => {
      spyOn(pupilDataService, 'sqlFindOneByIdAndSchool').and.returnValue(pupilMockPromise())
      const service = setupService(pupilDataService)
      await service.fetchOnePupil('arg1', 'arg2')
      expect(pupilDataService.sqlFindOneByIdAndSchool).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })

  describe('#fetchOnePupilBySlug', () => {
    const schoolId = 1
    it('it makes a call to the pupilDataService', async () => {
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue(pupilMockPromise())
      const service = setupService(pupilDataService)
      await service.fetchOnePupilBySlug('slug', schoolId)
      expect(pupilDataService.sqlFindOneBySlugAndSchool).toHaveBeenCalledWith('slug', schoolId)
    })
  })

  describe('#getPrintPupils', () => {
    const dfeNumber = 9991999
    const service = require('../../../services/pupil.service')

    it('throws an error if the dfeNumber is not supplied', async () => {
      try {
        await service.getPrintPupils()
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe(`dfeNumber is required`)
      }
    })

    it('finds the pupils', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsWithActivePins').and.returnValue(Promise.resolve([pupilMock]))
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve(schoolMock))
      await service.getPrintPupils(dfeNumber)
      expect(pupilDataService.sqlFindPupilsWithActivePins).toHaveBeenCalled()
    })

    it('finds the school', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsWithActivePins').and.returnValue(Promise.resolve([pupilMock]))
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve(schoolMock))
      await service.getPrintPupils(dfeNumber)
      expect(schoolDataService.sqlFindOneByDfeNumber).toHaveBeenCalled()
    })

    it('throws an error if the pupils are not found', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsWithActivePins').and.returnValue(Promise.resolve(undefined))
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve(schoolMock))
      try {
        await service.getPrintPupils(dfeNumber)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe(`Pupils not found for ${dfeNumber}`)
      }
    })

    it('throws an error if the school is not found', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsWithActivePins').and.returnValue(Promise.resolve([pupilMock]))
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve(undefined))
      try {
        await service.getPrintPupils(dfeNumber)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe(`School not found for ${dfeNumber}`)
      }
    })

    it('returns formatted objects', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsWithActivePins').and.returnValue(Promise.resolve([pupilMock]))
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve(schoolMock))
      const pupils = await service.getPrintPupils(dfeNumber)
      const pupil = pupils[0]
      expect(pupil.fullName).toBe('Pupil One')
      expect(pupil.pupilPin).toBe(4466)
      expect(pupil.schoolPin).toBe('newpin88')
    })
  })

  describe('#getPupilsByUrlSlug', () => {
    // const schoolId = 1
    it('it makes a call to the pupilDataService', async () => {
      const schoolId = 42
      spyOn(pupilDataService, 'sqlFindPupilsByUrlSlug').and.returnValue([pupilMock])
      const service = setupService(pupilDataService)
      await service.getPupilsByUrlSlug(['slug'], schoolId)
      expect(pupilDataService.sqlFindPupilsByUrlSlug).toHaveBeenCalledWith(['slug'], schoolId)
    })
  })

  describe('#getPupilsWithFullNames', () => {
    it('it returns an object with combined name values and urlSlug', async () => {
      const pupilMocks = [
        { foreName: 'John', middleNames: 'Test', lastName: 'Johnson', urlSlug: 'AA-12345' },
        { foreName: 'John2', middleNames: '', lastName: 'Johnson2', urlSlug: 'BB-12345' }
      ]
      spyOn(pupilDataService, 'sqlFindPupilsBySchoolID').and.returnValue(pupilMocks)
      let pupils
      try {
        pupils = await pupilService.getPupilsWithFullNames(1234567)
      } catch (error) {
        fail()
      }
      expect(pupils[0].fullName).toBe('Johnson John Test')
      expect(pupils[1].fullName).toBe('Johnson2 John2')
      expect(pupils[0].urlSlug).toBe('AA-12345')
      expect(pupils.length).toBe(2)
    })
    it('it throws an error when schoolID is not provided', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsBySchoolID')
      try {
        await pupilService.getPupilsWithFullNames()
        fail()
      } catch (error) {
        expect(error.message).toBe('schoolID is not provided')
      }
      expect(pupilDataService.sqlFindPupilsBySchoolID).not.toHaveBeenCalled()
    })
  })
})
