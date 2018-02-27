'use strict'

const R = require('ramda')
const proxyquire = require('proxyquire').noCallThru()
const pupilService = require('../../services/pupil.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')
const pupilWithGroupAndStatusMock = require('../mocks/pupils-with-group-and-status')
const schoolDataService = require('../../services/data-access/school.data.service')

/* global describe, it, expect, spyOn, fail */

describe('pupil service', () => {
  const getPupil = () => R.assoc('school', R.clone(schoolMock), pupilMock)

  const pupilMockPromise = () => {
    return Promise.resolve(getPupil())
  }

  function setupService (pupilDataService) {
    return proxyquire('../../services/pupil.service', {
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
    const service = require('../../services/pupil.service')

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
      spyOn(pupilDataService, 'sqlFindPupilsByUrlSlug').and.returnValue([pupilMock])
      const service = setupService(pupilDataService)
      await service.getPupilsByUrlSlug(['slug'])
      expect(pupilDataService.sqlFindPupilsByUrlSlug).toHaveBeenCalledWith(['slug'])
    })
  })

  describe('#sortByStatus', () => {
    it('it sorts an array of pupils by status asc', async () => {
      const mock = pupilWithGroupAndStatusMock
      const service = setupService(pupilService)
      const sortedPupils = await service.sortByStatus(mock, 'asc')
      expect(sortedPupils[0].foreName).toBe('Juliana')
      expect(sortedPupils[1].foreName).toBe('Gregory')
      expect(sortedPupils[2].foreName).toBe('Burns')
      expect(sortedPupils[3].foreName).toBe('Koch')
    })

    it('it sorts an array of pupils by status desc', async () => {
      const mock = pupilWithGroupAndStatusMock
      const service = setupService(pupilService)
      const sortedPupils = await service.sortByStatus(mock, 'desc')
      expect(sortedPupils[0].foreName).toBe('Ebony')
      expect(sortedPupils[1].foreName).toBe('Nieves')
      expect(sortedPupils[2].foreName).toBe('Juliana')
      expect(sortedPupils[3].foreName).toBe('Gregory')
    })
  })

  describe('#sortByGroup', () => {
    it('it sorts an array of pupils by group asc', async () => {
      const mock = pupilWithGroupAndStatusMock
      const service = setupService(pupilService)
      const sortedPupils = await service.sortByGroup(mock, 'asc')
      expect(sortedPupils[0].foreName).toBe('Ebony')
      expect(sortedPupils[1].foreName).toBe('Gregory')
      expect(sortedPupils[2].foreName).toBe('Nieves')
      expect(sortedPupils[3].foreName).toBe('Koch')
    })

    it('it sorts an array of pupils by group desc', async () => {
      const mock = pupilWithGroupAndStatusMock
      const service = setupService(pupilService)
      const sortedPupils = await service.sortByGroup(mock, 'desc')
      expect(sortedPupils[0].foreName).toBe('Nieves')
      expect(sortedPupils[1].foreName).toBe('Koch')
      expect(sortedPupils[2].foreName).toBe('Bessie')
      expect(sortedPupils[3].foreName).toBe('Ebony')
    })
  })
})
