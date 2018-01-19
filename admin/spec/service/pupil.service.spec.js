'use strict'

const R = require('ramda')
const proxyquire = require('proxyquire').noCallThru()
const pupilDataService = require('../../services/data-access/pupil.data.service')
const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')
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

  describe('#fetchMultiplePupils', () => {
    it('it makes a call to the pupilDataService for each pupil', async () => {
      spyOn(pupilDataService, 'findOne').and.returnValue(pupilMockPromise())
      const service = setupService(pupilDataService)
      const res = await service.fetchMultiplePupils([ 1, 2, 3, 4, 5 ])
      expect(pupilDataService.findOne).toHaveBeenCalledTimes(5)
      expect(res.length).toBe(5)
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
      expect(pupil.pupilPin).toBe('d55sg')
      expect(pupil.schoolPin).toBe('newpin88')
    })
  })
})
