'use strict'
/* global describe, beforeEach, it, expect spyOn */

const pupilMock = require('../../mocks/pupil')
const schoolMock = require('../../mocks/school')
const sqlResponseMock = require('../../mocks/sql-modify-response')
const sqlService = require('../../../services/data-access/sql.service')

describe('pupil.data.service', () => {
  let service

  describe('#sqlUpdate', () => {
    beforeEach(() => {
      spyOn(sqlService, 'update').and.returnValue(Promise.resolve(sqlResponseMock))
      service = require('../../../services/data-access/pupil.data.service')
    })

    it('it makes the expected calls', async () => {
      const obj = {
        id: 42,
        updatedProp: 'new value'
      }
      const res = await service.sqlUpdate(obj)
      expect(sqlService.update).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlFindPupilsWithActivePins', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([pupilMock]))
      service = require('../../../services/data-access/pupil.data.service')
    })

    it('it makes the expected calls', async () => {
      const dfeNumber = 9991001
      await service.sqlFindPupilsWithActivePins(dfeNumber)
      expect(sqlService.query).toHaveBeenCalled()
    })
  })

  describe('#sqlFindOneByPinAndSchoolPin', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve({ pupil: pupilMock, school: schoolMock }))
      service = require('../../../services/data-access/pupil.data.service')
    })

    it('it makes the expected calls', async () => {
      const dfeNumber = 9991001
      const pupil = pupilMock
      await service.sqlFindOneByPinAndSchoolPin(pupil.pin, dfeNumber)
      expect(sqlService.query).toHaveBeenCalled()
    })
  })
})
