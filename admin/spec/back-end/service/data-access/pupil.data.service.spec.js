'use strict'

const pupilMock = require('../../mocks/pupil')
const sqlResponseMock = require('../../mocks/sql-modify-response')
const sqlService = require('../../../../services/data-access/sql.service')

describe('pupil.data.service', () => {
  let service

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#sqlFindPupilsBySchoolId', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'query').mockResolvedValue([pupilMock])
      service = require('../../../../services/data-access/pupil.data.service')
    })

    test('it makes the expected calls', async () => {
      const res = await service.sqlFindPupilsBySchoolId(12345678)
      expect(sqlService.query).toHaveBeenCalled()
      expect(Array.isArray(res)).toBe(true)
    })
  })

  describe('#sqlFindOneBySlug', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'query').mockResolvedValue([pupilMock])
      service = require('../../../../services/data-access/pupil.data.service')
    })

    test('it makes the expected calls', async () => {
      const res = await service.sqlFindOneBySlug('abc-def-ghi')
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlFindOneByUpn', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'query').mockResolvedValue([pupilMock])
      service = require('../../../../services/data-access/pupil.data.service')
    })

    test('it makes the expected calls', async () => {
      const res = await service.sqlFindOneByUpn('AB123456789')
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlFindOneById', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'query').mockResolvedValue([pupilMock])
      service = require('../../../../services/data-access/pupil.data.service')
    })

    test('it makes the expected calls', async () => {
      const res = await service.sqlFindOneById(42)
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlFindOneByIdAndSchool', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'query').mockResolvedValue([pupilMock])
      service = require('../../../../services/data-access/pupil.data.service')
    })

    test('it makes the expected calls', async () => {
      const res = await service.sqlFindOneByIdAndSchool(42, 26)
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlUpdate', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'update').mockResolvedValue(sqlResponseMock)
      service = require('../../../../services/data-access/pupil.data.service')
    })

    test('it makes the expected calls', async () => {
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
      jest.spyOn(sqlService, 'create').mockResolvedValue(sqlResponseMock)
      service = require('../../../../services/data-access/pupil.data.service')
    })

    test('it makes the expected calls', async () => {
      const obj = {
        id: 42,
        prop: 'new value'
      }
      const res = await service.sqlCreate(obj)
      expect(sqlService.create).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlFindOneByPinAndSchool', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'query').mockResolvedValue([pupilMock])
      service = require('../../../../services/data-access/pupil.data.service')
    })

    test('it makes the expected calls', async () => {
      const dfeNumber = 9991001
      const pupil = pupilMock
      await service.sqlFindOneByPinAndSchool(pupil.pin, dfeNumber)
      expect(sqlService.query).toHaveBeenCalled()
    })
  })
})
