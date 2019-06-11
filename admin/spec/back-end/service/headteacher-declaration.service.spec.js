'use strict'
/* global describe it expect beforeEach spyOn fail */

const R = require('ramda')
const moment = require('moment')

const headteacherDeclarationDataService = require('../../../services/data-access/headteacher-declaration.data.service')
const schoolDataService = require('../../../services/data-access/school.data.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const attendanceCodeDataService = require('../../../services/data-access/attendance-code.data.service')
const pupilAttendanceDataService = require('../../../services/data-access/pupil-attendance.data.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const sqlResponseMock = require('../mocks/sql-modify-response')
const schoolMock = require('../mocks/school')
const hdfMock = require('../mocks/sql-hdf')
const checkWindowMock = require('../mocks/check-window')

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
    const schoolID = 123
    const userId = 777

    describe('when the school is found', () => {
      beforeEach(() => {
        spyOn(headteacherDeclarationDataService, 'sqlCreate').and.returnValue(Promise.resolve(sqlResponseMock))
        spyOn(schoolDataService, 'sqlFindOneById').and.returnValue(Promise.resolve(schoolMock))
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue(Promise.resolve(checkWindowMock))
        spyOn(service, 'getEligibilityForSchool').and.returnValue(true)
      })

      it('calls getEligibilityForSchool', async () => {
        await service.submitDeclaration(form, userId, schoolID)
        expect(service.getEligibilityForSchool).toHaveBeenCalled()
      })

      it('calls the headteacher data service', async () => {
        await service.submitDeclaration(form, userId, schoolID)
        expect(headteacherDeclarationDataService.sqlCreate).toHaveBeenCalled()
      })

      it('adds a signedDate field to the form', async () => {
        await service.submitDeclaration(form, userId, schoolID)
        const arg = headteacherDeclarationDataService.sqlCreate.calls.mostRecent().args[0]
        expect(arg.signedDate).toBeTruthy()
      })

      it('adds the userId to the form', async () => {
        await service.submitDeclaration(form, userId, schoolID)
        const arg = headteacherDeclarationDataService.sqlCreate.calls.mostRecent().args[0]
        expect(arg.user_id).toBe(userId)
      })

      it('adds the dfeNumber to the form', async () => {
        await service.submitDeclaration(form, userId, schoolID)
        const arg = headteacherDeclarationDataService.sqlCreate.calls.mostRecent().args[0]
        expect(arg.school_id).toBe(schoolMock.id)
      })
    })

    describe('when the school is not found', () => {
      it('throws an error', async () => {
        spyOn(headteacherDeclarationDataService, 'sqlCreate').and.returnValue(Promise.resolve(sqlResponseMock))
        spyOn(schoolDataService, 'sqlFindOneById').and.returnValue(Promise.resolve(undefined))
        try {
          await service.submitDeclaration(form, userId, schoolID)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe(`school ${schoolID} not found`)
        }
      })
    })

    describe('when not eligible', () => {
      it('throws an error', async () => {
        spyOn(headteacherDeclarationDataService, 'sqlCreate').and.returnValue(Promise.resolve(sqlResponseMock))
        spyOn(schoolDataService, 'sqlFindOneById').and.returnValue(Promise.resolve(schoolMock))
        spyOn(service, 'getEligibilityForSchool').and.returnValue(false)
        try {
          await service.submitDeclaration(form, userId, schoolID)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe(`Not eligible to submit declaration`)
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
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue(Promise.resolve(checkWindowMock))
      spyOn(service, 'isHdfSubmittedForCheck')
      await service.isHdfSubmittedForCurrentCheck(dfeNumber)
      expect(service.isHdfSubmittedForCheck).toHaveBeenCalledWith(dfeNumber, checkWindowMock.id)
    })

    it('returns false if there isnt an active check window', async () => {
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue(Promise.resolve(undefined))
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
        expect(error.message).toBe('schoolID and checkWindowId are required')
      }
    })

    it('throws an error when no checkWindowId is provided', async () => {
      try {
        await service.isHdfSubmittedForCheck(dfeNumber, null)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('schoolID and checkWindowId are required')
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
    const schoolID = 123
    const service = require('../../../services/headteacher-declaration.service')

    it('throws an error when no schoolId is provided', async () => {
      try {
        await service.findPupilsForSchool(null)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('schoolId is required')
      }
    })

    it('finds the pupils using the dfeNumber', async () => {
      spyOn(headteacherDeclarationDataService, 'sqlFindPupilsWithStatusAndAttendanceReasons').and.returnValue('Mock pupils result')
      const result = await service.findPupilsForSchool(schoolID)
      expect(headteacherDeclarationDataService.sqlFindPupilsWithStatusAndAttendanceReasons).toHaveBeenCalledWith(schoolID)
      expect(result).toEqual('Mock pupils result')
    })
  })

  describe('findPupilBySlugAndDfeNumber', () => {
    const urlSlug = 'xxx-xxx-xxx-xxx'
    const dfeNumber = 9991999
    const service = require('../../../services/headteacher-declaration.service')

    it('throws an error when no dfeNumber is provided', async () => {
      try {
        await service.findPupilBySlugAndDfeNumber(null, dfeNumber)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('urlSlug and dfeNumber are required')
      }
    })

    it('throws an error when no urlSlug is provided', async () => {
      try {
        await service.findPupilBySlugAndDfeNumber(urlSlug, null)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('urlSlug and dfeNumber are required')
      }
    })

    it('throws an error when a school is not found for the dfeNumber', async () => {
      try {
        spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.throwError('School not found')
        await service.findPupilBySlugAndDfeNumber(urlSlug, dfeNumber)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe(`School not found`)
      }
    })

    it('finds the pupil using the urlSlug and dfeNumber', async () => {
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(schoolMock)
      spyOn(pupilDataService, 'sqlFindOneWithAttendanceReasonsBySlugAndSchool').and.returnValue('Mock pupil result')
      const result = await service.findPupilBySlugAndDfeNumber(urlSlug, dfeNumber)
      expect(pupilDataService.sqlFindOneWithAttendanceReasonsBySlugAndSchool).toHaveBeenCalledWith(urlSlug, schoolMock.id)
      expect(result).toEqual('Mock pupil result')
    })
  })

  describe('updatePupilsAttendanceCode', () => {
    const pupilIds = [1]
    const userId = 1
    const attendanceCode = 'XXX'
    const service = require('../../../services/headteacher-declaration.service')

    it('throws an error when no pupilIds are provided', async () => {
      try {
        await service.updatePupilsAttendanceCode(null, attendanceCode, userId)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('pupilIds, code and userId are required')
      }
    })

    it('throws an error when no code is provided', async () => {
      try {
        await service.updatePupilsAttendanceCode(pupilIds, null, userId)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('pupilIds, code and userId are required')
      }
    })

    it('throws an error when no userId is provided', async () => {
      try {
        await service.updatePupilsAttendanceCode(pupilIds, attendanceCode, null)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('pupilIds, code and userId are required')
      }
    })

    it('throws an error when an invalid attendance code is provided', async () => {
      try {
        spyOn(attendanceCodeDataService, 'sqlFindOneAttendanceCodeByCode').and.throwError('Attendance code not found')
        await service.updatePupilsAttendanceCode(pupilIds, attendanceCode, userId)
        fail('expected to throw')
      } catch (error) {
        expect(attendanceCodeDataService.sqlFindOneAttendanceCodeByCode).toHaveBeenCalledWith(attendanceCode)
        expect(error.message).toBe(`Attendance code not found`)
      }
    })

    it('calls pupilAttendanceDataService.sqlUpdateBatch', async () => {
      const attendanceCodeMock = { id: 99 }
      spyOn(attendanceCodeDataService, 'sqlFindOneAttendanceCodeByCode').and.returnValue(attendanceCodeMock)
      spyOn(pupilAttendanceDataService, 'sqlUpdateBatch').and.returnValue('Mock result')
      const result = await service.updatePupilsAttendanceCode(pupilIds, attendanceCode, userId)
      expect(attendanceCodeDataService.sqlFindOneAttendanceCodeByCode).toHaveBeenCalledWith(attendanceCode)
      expect(pupilAttendanceDataService.sqlUpdateBatch).toHaveBeenCalledWith(pupilIds, attendanceCodeMock.id, userId)
      expect(result).toEqual('Mock result')
    })
  })
})
