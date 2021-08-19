'use strict'
/* global describe it expect beforeEach spyOn fail */

const R = require('ramda')
const moment = require('moment')

const headteacherDeclarationDataService = require('../../../services/data-access/headteacher-declaration.data.service')
const pupilStatusDataService = require('../../../services/data-access/pupil-status.data.service')
const schoolDataService = require('../../../services/data-access/school.data.service')
const attendanceCodeDataService = require('../../../services/data-access/attendance-code.data.service')
const pupilAttendanceDataService = require('../../../services/data-access/pupil-attendance.data.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const sqlResponseMock = require('../mocks/sql-modify-response')
const schoolMock = require('../mocks/school')
const hdfMock = require('../mocks/sql-hdf')
const checkWindowMock = require('../mocks/check-window').legacy
const settingsService = require('../../../services/setting.service')
const pupilStatusService = require('../../../services/pupil-status.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')

describe('headteacherDeclarationService', () => {
  describe('#getEligibilityForSchool', () => {
    const dfeNumber = 123
    describe('when check end date is in the future', () => {
      it('should call sqlFindPupilsBlockingHdfBeforeCheckEndDate', async () => {
        spyOn(headteacherDeclarationDataService, 'sqlFindPupilsBlockingHdfBeforeCheckEndDate')
        const service = require('../../../services/headteacher-declaration.service')
        const checkEndDate = moment.utc().add(5, 'days')
        await service.getEligibilityForSchool(dfeNumber, checkEndDate)
        expect(headteacherDeclarationDataService.sqlFindPupilsBlockingHdfBeforeCheckEndDate).toHaveBeenCalled()
      })
      it('should return true if no pupils blocking are detected', async () => {
        spyOn(headteacherDeclarationDataService, 'sqlFindPupilsBlockingHdfBeforeCheckEndDate').and.returnValue(0)
        const service = require('../../../services/headteacher-declaration.service')
        const checkEndDate = moment.utc().add(5, 'days')
        const result = await service.getEligibilityForSchool(dfeNumber, checkEndDate)
        expect(result).toBeTruthy()
      })
      it('should return false if no pupils blocking are detected', async () => {
        spyOn(headteacherDeclarationDataService, 'sqlFindPupilsBlockingHdfBeforeCheckEndDate').and.returnValue(1)
        const service = require('../../../services/headteacher-declaration.service')
        const checkEndDate = moment.utc().add(5, 'days')
        const result = await service.getEligibilityForSchool(dfeNumber, checkEndDate)
        expect(result).toBeFalsy()
      })
    })
    describe('when check end date is in the past', () => {
      it('should call sqlFindPupilsBlockingHdfBeforeCheckEndDate', async () => {
        spyOn(headteacherDeclarationDataService, 'sqlFindPupilsBlockingHdfAfterCheckEndDate')
        const service = require('../../../services/headteacher-declaration.service')
        const checkEndDate = moment.utc().subtract(5, 'days')
        await service.getEligibilityForSchool(dfeNumber, checkEndDate)
        expect(headteacherDeclarationDataService.sqlFindPupilsBlockingHdfAfterCheckEndDate).toHaveBeenCalled()
      })
      it('should return true if no pupils blocking are detected', async () => {
        spyOn(headteacherDeclarationDataService, 'sqlFindPupilsBlockingHdfAfterCheckEndDate').and.returnValue(0)
        const service = require('../../../services/headteacher-declaration.service')
        const checkEndDate = moment.utc().subtract(5, 'days')
        const result = await service.getEligibilityForSchool(dfeNumber, checkEndDate)
        expect(result).toBeTruthy()
      })
      it('should return false if no pupils blocking are detected', async () => {
        spyOn(headteacherDeclarationDataService, 'sqlFindPupilsBlockingHdfAfterCheckEndDate').and.returnValue(1)
        const service = require('../../../services/headteacher-declaration.service')
        const checkEndDate = moment.utc().subtract(5, 'days')
        const result = await service.getEligibilityForSchool(dfeNumber, checkEndDate)
        expect(result).toBeFalsy()
      })
    })
  })

  describe('#submitDeclaration', () => {
    /**
     * @type headteacherDeclarationService
     */
    const service = require('../../../services/headteacher-declaration.service')
    const form = {
      jobTitle: 'Head',
      fullName: 'Hubert J. Farnsworth',
      declaration: 'signed'
    }
    const schoolId = 123
    const userId = 777

    describe('when the school is found', () => {
      beforeEach(() => {
        spyOn(headteacherDeclarationDataService, 'sqlCreate').and.returnValue(Promise.resolve(sqlResponseMock))
        spyOn(schoolDataService, 'sqlFindOneById').and.returnValue(Promise.resolve(schoolMock))
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue(Promise.resolve(checkWindowMock))
        spyOn(service, 'getEligibilityForSchool').and.returnValue(true)
      })

      it('calls getEligibilityForSchool', async () => {
        await service.submitDeclaration(form, userId, schoolId)
        expect(service.getEligibilityForSchool).toHaveBeenCalled()
      })

      it('calls the headteacher data service', async () => {
        await service.submitDeclaration(form, userId, schoolId)
        expect(headteacherDeclarationDataService.sqlCreate).toHaveBeenCalled()
      })

      it('adds a signedDate field to the form', async () => {
        await service.submitDeclaration(form, userId, schoolId)
        const arg = headteacherDeclarationDataService.sqlCreate.calls.mostRecent().args[0]
        expect(arg.signedDate).toBeTruthy()
      })

      it('adds the userId to the form', async () => {
        await service.submitDeclaration(form, userId, schoolId)
        const arg = headteacherDeclarationDataService.sqlCreate.calls.mostRecent().args[0]
        expect(arg.user_id).toBe(userId)
      })

      it('adds the dfeNumber to the form', async () => {
        await service.submitDeclaration(form, userId, schoolId)
        const arg = headteacherDeclarationDataService.sqlCreate.calls.mostRecent().args[0]
        expect(arg.school_id).toBe(schoolMock.id)
      })
    })

    describe('when the school is not found', () => {
      it('throws an error', async () => {
        spyOn(headteacherDeclarationDataService, 'sqlCreate').and.returnValue(Promise.resolve(sqlResponseMock))
        spyOn(schoolDataService, 'sqlFindOneById').and.returnValue(Promise.resolve(undefined))
        try {
          await service.submitDeclaration(form, userId, schoolId)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe(`school ${schoolId} not found`)
        }
      })
    })

    describe('when not eligible', () => {
      it('throws an error', async () => {
        spyOn(headteacherDeclarationDataService, 'sqlCreate').and.returnValue(Promise.resolve(sqlResponseMock))
        spyOn(schoolDataService, 'sqlFindOneById').and.returnValue(Promise.resolve(schoolMock))
        spyOn(service, 'getEligibilityForSchool').and.returnValue(false)
        try {
          await service.submitDeclaration(form, userId, schoolId)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('Not eligible to submit declaration')
        }
      })
    })
  })

  describe('findLatestHdfForSchool', () => {
    const dfeNumber = 9991999
    const service = require('../../../services/headteacher-declaration.service')
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
    const service = require('../../../services/headteacher-declaration.service')

    it('calls isHdfSubmittedForCheck', async () => {
      const checkWindowId = 1
      spyOn(service, 'isHdfSubmittedForCheck')
      await service.isHdfSubmittedForCurrentCheck(dfeNumber, checkWindowId)
      expect(service.isHdfSubmittedForCheck).toHaveBeenCalledWith(dfeNumber, checkWindowId)
    })

    it('returns false if a check window id is not provided', async () => {
      const res = await service.isHdfSubmittedForCurrentCheck(dfeNumber)
      expect(res).toBeFalsy()
    })
  })

  describe('#isHdfSubmittedForCheck', () => {
    const dfeNumber = 9991999
    const service = require('../../../services/headteacher-declaration.service')

    it('throws an error when no dfeNumber is provided', async () => {
      try {
        await service.isHdfSubmittedForCheck(null, 1)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('schoolId and checkWindowId are required')
      }
    })

    it('throws an error when no checkWindowId is provided', async () => {
      try {
        await service.isHdfSubmittedForCheck(dfeNumber, null)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('schoolId and checkWindowId are required')
      }
    })

    it('calls findHdfForCheck', async () => {
      spyOn(headteacherDeclarationDataService, 'sqlFindHdfForCheck').and.returnValue(Promise.resolve(hdfMock))
      await service.isHdfSubmittedForCheck(dfeNumber, 1)
      expect(headteacherDeclarationDataService.sqlFindHdfForCheck).toHaveBeenCalledWith(dfeNumber, 1)
    })

    it('returns false if there isnt a current HDF for the school', async () => {
      spyOn(headteacherDeclarationDataService, 'sqlFindHdfForCheck').and.returnValue(Promise.resolve(undefined))
      const res = await service.isHdfSubmittedForCheck(dfeNumber, 1)
      expect(res).toBeFalsy()
    })

    it('returns true if there is a valid HDF for the school', async () => {
      spyOn(headteacherDeclarationDataService, 'sqlFindHdfForCheck').and.returnValue(Promise.resolve(hdfMock))
      const res = await service.isHdfSubmittedForCheck(dfeNumber, 1)
      expect(res).toBeTruthy()
    })

    it('returns false if the HDF is invalid', async () => {
      const invalidHdf = R.assoc('signedDate', null, hdfMock)
      spyOn(headteacherDeclarationDataService, 'sqlFindHdfForCheck').and.returnValue(Promise.resolve(invalidHdf))
      const res = await service.isHdfSubmittedForCheck(dfeNumber, 1)
      expect(res).toBeFalsy()
    })
  })

  describe('findPupilsForSchool', () => {
    const schoolId = 123
    const service = require('../../../services/headteacher-declaration.service')

    it('throws an error when no schoolId is provided', async () => {
      try {
        await service.findPupilsForSchool(null)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('schoolId is required')
      }
    })

    it('finds the pupils using the schoolId', async () => {
      spyOn(pupilStatusService, 'getPupilStatusData')
      await service.findPupilsForSchool(schoolId)
      expect(pupilStatusService.getPupilStatusData).toHaveBeenCalledWith(schoolId)
    })
  })

  describe('findPupilBySlugAndSchoolId', () => {
    const urlSlug = 'xxx-xxx-xxx-xxx'
    const schoolId = 1
    const service = require('../../../services/headteacher-declaration.service')

    it('throws an error when no urlSlug is provided', async () => {
      try {
        await service.findPupilBySlugAndSchoolId(null, schoolId)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('urlSlug param is required')
      }
    })

    it('throws an error when no schoolId is provided', async () => {
      try {
        await service.findPupilBySlugAndSchoolId(urlSlug, null)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('schoolId param is required')
      }
    })

    it('finds the pupil using the urlSlug and schoolId', async () => {
      spyOn(pupilStatusDataService, 'sqlFindOnePupilFullStatus').and.returnValue('Mock pupil result')
      spyOn(settingsService, 'get').and.returnValue({ checkTimeLimit: 30 })
      const result = await service.findPupilBySlugAndSchoolId(urlSlug, schoolId)
      expect(pupilStatusDataService.sqlFindOnePupilFullStatus).toHaveBeenCalledWith(urlSlug, schoolId)
      expect(result.status).toEqual('Not started')
    })
  })

  describe('updatePupilsAttendanceCode', () => {
    const pupilIds = [1]
    const userId = 1
    const attendanceCode = 'XXX'
    const schoolId = 42
    const service = require('../../../services/headteacher-declaration.service')

    it('throws an error when no pupilIds are provided', async () => {
      try {
        spyOn(redisCacheService, 'drop')
        await service.updatePupilsAttendanceCode(null, attendanceCode, userId, schoolId)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('pupilIds, code and userId are required')
      }
    })

    it('throws an error when no code is provided', async () => {
      try {
        spyOn(redisCacheService, 'drop')
        await service.updatePupilsAttendanceCode(pupilIds, null, userId, schoolId)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('pupilIds, code and userId are required')
      }
    })

    it('throws an error when no userId is provided', async () => {
      try {
        spyOn(redisCacheService, 'drop')
        await service.updatePupilsAttendanceCode(pupilIds, attendanceCode, null, schoolId)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('pupilIds, code and userId are required')
      }
    })

    it('throws an error when an invalid attendance code is provided', async () => {
      try {
        spyOn(redisCacheService, 'drop')
        spyOn(attendanceCodeDataService, 'sqlFindOneAttendanceCodeByCode').and.throwError('Attendance code not found')
        await service.updatePupilsAttendanceCode(pupilIds, attendanceCode, userId, schoolId)
        fail('expected to throw')
      } catch (error) {
        expect(attendanceCodeDataService.sqlFindOneAttendanceCodeByCode).toHaveBeenCalledWith(attendanceCode)
        expect(error.message).toBe('Attendance code not found')
      }
    })

    it('calls pupilAttendanceDataService.sqlUpdateBatch', async () => {
      const attendanceCodeMock = { id: 99 }
      spyOn(redisCacheService, 'drop')
      spyOn(attendanceCodeDataService, 'sqlFindOneAttendanceCodeByCode').and.returnValue(attendanceCodeMock)
      spyOn(pupilAttendanceDataService, 'sqlUpdateBatch').and.returnValue('Mock result')
      await service.updatePupilsAttendanceCode(pupilIds, attendanceCode, userId, schoolId)
      expect(attendanceCodeDataService.sqlFindOneAttendanceCodeByCode).toHaveBeenCalledWith(attendanceCode)
      expect(pupilAttendanceDataService.sqlUpdateBatch).toHaveBeenCalledWith(pupilIds, attendanceCodeMock.id, userId)
    })

    it('drops the school results cache', async () => {
      const attendanceCodeMock = { id: 99 }
      spyOn(attendanceCodeDataService, 'sqlFindOneAttendanceCodeByCode').and.returnValue(attendanceCodeMock)
      spyOn(pupilAttendanceDataService, 'sqlUpdateBatch').and.returnValue('Mock result')
      spyOn(redisCacheService, 'drop')
      await service.updatePupilsAttendanceCode(pupilIds, attendanceCode, userId, schoolId)
      expect(redisCacheService.drop).toHaveBeenCalled()
    })
  })
})
