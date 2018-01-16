'use strict'

const R = require('ramda')
const proxyquire = require('proxyquire').noCallThru()
const pupilDataService = require('../../services/data-access/pupil.data.service')
const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')

/* global describe, it, expect, spyOn */

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
})
