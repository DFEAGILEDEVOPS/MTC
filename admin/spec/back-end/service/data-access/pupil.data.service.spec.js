'use strict'
/* global describe, beforeEach, it, expect spyOn */

const pupilMock = require('../../mocks/pupil')
const sqlResponseMock = require('../../mocks/sql-modify-response')
const sqlService = require('../../../../services/data-access/sql.service')

describe('pupil.data.service', () => {
  let service

  describe('#sqlFindPupilsByDfeNumber', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([pupilMock]))
      service = require('../../../../services/data-access/pupil.data.service')
    })

    it('it makes the expected calls', async () => {
      const res = await service.sqlFindPupilsByDfeNumber(12345678)
      expect(sqlService.query).toHaveBeenCalled()
      expect(Array.isArray(res)).toBe(true)
    })
  })

  describe('#sqlFindOneBySlug', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([pupilMock]))
      service = require('../../../../services/data-access/pupil.data.service')
    })

    it('it makes the expected calls', async () => {
      const res = await service.sqlFindOneBySlug('abc-def-ghi')
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlFindOneByUpn', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([pupilMock]))
      service = require('../../../../services/data-access/pupil.data.service')
    })

    it('it makes the expected calls', async () => {
      const res = await service.sqlFindOneByUpn('AB123456789')
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlFindOneById', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([pupilMock]))
      service = require('../../../../services/data-access/pupil.data.service')
    })

    it('it makes the expected calls', async () => {
      const res = await service.sqlFindOneById(42)
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlFindOneByIdAndSchool', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([pupilMock]))
      service = require('../../../../services/data-access/pupil.data.service')
    })

    it('it makes the expected calls', async () => {
      const res = await service.sqlFindOneByIdAndSchool(42, 26)
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlUpdate', () => {
    beforeEach(() => {
      spyOn(sqlService, 'update').and.returnValue(Promise.resolve(sqlResponseMock))
      service = require('../../../../services/data-access/pupil.data.service')
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

  describe('#sqlCreate', () => {
    beforeEach(() => {
      spyOn(sqlService, 'create').and.returnValue(Promise.resolve(sqlResponseMock))
      service = require('../../../../services/data-access/pupil.data.service')
    })

    it('it makes the expected calls', async () => {
      const obj = {
        id: 42,
        prop: 'new value'
      }
      const res = await service.sqlCreate(obj)
      expect(sqlService.create).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlFindPupilsWithActivePins', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([pupilMock]))
      service = require('../../../../services/data-access/pupil.data.service')
    })

    it('it makes the expected calls', async () => {
      const dfeNumber = 9991001
      await service.sqlFindPupilsWithActivePins(dfeNumber)
      expect(sqlService.query).toHaveBeenCalled()
    })
  })

  describe('#sqlFindOneByPinAndSchool', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([ pupilMock ]))
      service = require('../../../../services/data-access/pupil.data.service')
    })

    it('it makes the expected calls', async () => {
      const dfeNumber = 9991001
      const pupil = pupilMock
      await service.sqlFindOneByPinAndSchool(pupil.pin, dfeNumber)
      expect(sqlService.query).toHaveBeenCalled()
    })
  })
})
