'use strict'
/* global describe it expect beforeEach spyOn fail */

const R = require('ramda')

const headteacherDeclarationDataService = require('../../services/data-access/headteacher-declaration.data.service')
const schoolDataService = require('../../services/data-access/school.data.service')
const sqlResponseMock = require('../mocks/sql-modify-response')
const schoolMock = require('../mocks/school')
const hdfMock = require('../mocks/sql-hdf')

describe('headteacherDeclarationService', () => {
  describe('#declare', () => {
    /**
     * @type headteacherDeclarationService
     */
    const service = require('../../services/headteacher-declaration.service')
    const form = {
      jobTitle: 'Head',
      fullName: 'Hubert J. Farnsworth',
      declaration: 'signed'
    }
    const dfeNumber = 9991999
    const userId = 777

    describe('when the school is found', () => {
      beforeEach(() => {
        spyOn(headteacherDeclarationDataService, 'sqlCreate').and.returnValue(Promise.resolve(sqlResponseMock))
        spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve(schoolMock))
      })

      it('calls the headteacher data service', async () => {
        await service.declare(form, dfeNumber, userId)
        expect(headteacherDeclarationDataService.sqlCreate).toHaveBeenCalled()
      })

      it('adds a signedDate field to the form', async () => {
        await service.declare(form, dfeNumber, userId)
        const arg = headteacherDeclarationDataService.sqlCreate.calls.mostRecent().args[0]
        expect(arg.signedDate).toBeTruthy()
      })

      it('adds the userId to the form', async () => {
        await service.declare(form, dfeNumber, userId)
        const arg = headteacherDeclarationDataService.sqlCreate.calls.mostRecent().args[0]
        expect(arg.user_id).toBe(userId)
      })

      it('adds the dfeNumber to the form', async () => {
        await service.declare(form, dfeNumber, userId)
        const arg = headteacherDeclarationDataService.sqlCreate.calls.mostRecent().args[0]
        expect(arg.school_id).toBe(schoolMock.id)
      })
    })

    describe('when the school is not found', () => {
      it('throws an error', async () => {
        spyOn(headteacherDeclarationDataService, 'sqlCreate').and.returnValue(Promise.resolve(sqlResponseMock))
        spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve(undefined))
        try {
          await service.declare(form, dfeNumber, userId)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe(`school ${dfeNumber} not found`)
        }
      })
    })
  })

  describe('findLatestHdfForSchool', () => {
    const dfeNumber = 9991999
    const service = require('../../services/headteacher-declaration.service')
    it('finds the school using the dfeNumber', async () => {
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve(schoolMock))
      spyOn(headteacherDeclarationDataService, 'sqlFindLatestHdfBySchoolId')
      await service.findLatestHdfForSchool(dfeNumber)
      expect(schoolDataService.sqlFindOneByDfeNumber).toHaveBeenCalledWith(dfeNumber)
    })

    it('returns null if the school is not found', async () => {
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve(undefined))
      const res = await service.findLatestHdfForSchool(dfeNumber)
      expect(res).toBeNull()
    })

    it('find the latest hdf and returns it', async () => {
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve(schoolMock))
      spyOn(headteacherDeclarationDataService, 'sqlFindLatestHdfBySchoolId').and.returnValue(hdfMock)
      const res = await service.findLatestHdfForSchool(dfeNumber)
      expect(res).toEqual(hdfMock)
      expect(headteacherDeclarationDataService.sqlFindLatestHdfBySchoolId).toHaveBeenCalledWith(schoolMock.id)
    })
  })

  describe('#isHdfSubmittedForCurrentCheck', () => {
    const dfeNumber = 9991999
    const service = require('../../services/headteacher-declaration.service')

    it('finds if there is a current HDF for the school', async () => {
      spyOn(headteacherDeclarationDataService, 'findCurrentHdfForSchool').and.returnValue(Promise.resolve(hdfMock))
      await service.isHdfSubmittedForCurrentCheck(dfeNumber)
      expect(headteacherDeclarationDataService.findCurrentHdfForSchool).toHaveBeenCalled()
    })

    it('returns false if there isnt a current HDF for the school', async () => {
      spyOn(headteacherDeclarationDataService, 'findCurrentHdfForSchool').and.returnValue(Promise.resolve(undefined))
      const res = await service.isHdfSubmittedForCurrentCheck(dfeNumber)
      expect(res).toBeFalsy()
    })

    it('returns true if there is a valid HDF for the school', async () => {
      spyOn(headteacherDeclarationDataService, 'findCurrentHdfForSchool').and.returnValue(Promise.resolve(hdfMock))
      const res = await service.isHdfSubmittedForCurrentCheck(dfeNumber)
      expect(res).toBeTruthy()
    })

    it('returns false if the HDF is invalid', async () => {
      const invalidHdf = R.assoc('signedDate', null, hdfMock)
      spyOn(headteacherDeclarationDataService, 'findCurrentHdfForSchool').and.returnValue(Promise.resolve(invalidHdf))
      const res = await service.isHdfSubmittedForCurrentCheck(dfeNumber)
      expect(res).toBeFalsy()
    })
  })
})
