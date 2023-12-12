'use strict'
/* global describe expect beforeEach test jest afterEach */

const R = require('ramda')

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
const service = require('../../../services/headteacher-declaration.service')
const { PupilFrozenService } = require('../../../services/pupil-frozen/pupil-frozen.service')

describe('headteacherDeclarationService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#getEligibilityForSchool', () => {
    const schoolId = 123

    test('should call sqlFindPupilsBlockingHdf', async () => {
      jest.spyOn(headteacherDeclarationDataService, 'sqlFindPupilsBlockingHdf').mockImplementation()
      await service.getEligibilityForSchool(schoolId)
      expect(headteacherDeclarationDataService.sqlFindPupilsBlockingHdf).toHaveBeenCalled()
    })

    test('should return true if no blocking pupils are detected', async () => {
      jest.spyOn(headteacherDeclarationDataService, 'sqlFindPupilsBlockingHdf').mockResolvedValue(0)
      const result = await service.getEligibilityForSchool(schoolId)
      expect(result).toBeTruthy()
    })

    test('should return false ifblocking  pupils  are detected', async () => {
      jest.spyOn(headteacherDeclarationDataService, 'sqlFindPupilsBlockingHdf').mockResolvedValue(1)
      const result = await service.getEligibilityForSchool(schoolId)
      expect(result).toBeFalsy()
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
        jest.spyOn(headteacherDeclarationDataService, 'sqlCreate').mockResolvedValue(sqlResponseMock)
        jest.spyOn(schoolDataService, 'sqlFindOneById').mockResolvedValue(schoolMock)
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(checkWindowMock)
        jest.spyOn(service, 'getEligibilityForSchool').mockResolvedValue(true)
      })

      test('calls getEligibilityForSchool', async () => {
        await service.submitDeclaration(form, userId, schoolId)
        expect(service.getEligibilityForSchool).toHaveBeenCalled()
      })

      test('calls the headteacher data service', async () => {
        await service.submitDeclaration(form, userId, schoolId)
        expect(headteacherDeclarationDataService.sqlCreate).toHaveBeenCalled()
      })

      test('adds a signedDate field to the form', async () => {
        await service.submitDeclaration(form, userId, schoolId)
        const arg = headteacherDeclarationDataService.sqlCreate.mock.calls.pop()[0]
        expect(arg.signedDate).toBeTruthy()
      })

      test('adds the userId to the form', async () => {
        await service.submitDeclaration(form, userId, schoolId)
        const arg = headteacherDeclarationDataService.sqlCreate.mock.calls.pop()[0]
        expect(arg.user_id).toBe(userId)
      })

      test('adds the dfeNumber to the form', async () => {
        await service.submitDeclaration(form, userId, schoolId)
        const arg = headteacherDeclarationDataService.sqlCreate.mock.calls.pop()[0]
        expect(arg.school_id).toBe(schoolMock.id)
      })
    })

    describe('when the school is not found', () => {
      test('throws an error', async () => {
        jest.spyOn(headteacherDeclarationDataService, 'sqlCreate').mockResolvedValue(sqlResponseMock)
        jest.spyOn(schoolDataService, 'sqlFindOneById').mockResolvedValue(undefined)
        await expect(service.submitDeclaration(form, userId, schoolId)).rejects.toThrow(`school ${schoolId} not found`)
      })
    })

    describe('when not eligible', () => {
      test('throws an error', async () => {
        jest.spyOn(headteacherDeclarationDataService, 'sqlCreate').mockResolvedValue(sqlResponseMock)
        jest.spyOn(schoolDataService, 'sqlFindOneById').mockResolvedValue(schoolMock)
        jest.spyOn(service, 'getEligibilityForSchool').mockResolvedValue(false)
        await expect(service.submitDeclaration(form, userId, schoolId)).rejects.toThrow('Not eligible to submit declaration')
      })
    })
  })

  describe('findLatestHdfForSchool', () => {
    const dfeNumber = 9991999
    const service = require('../../../services/headteacher-declaration.service')
    test('finds the school using the dfeNumber', async () => {
      jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue(schoolMock)
      jest.spyOn(headteacherDeclarationDataService, 'sqlFindLatestHdfBySchoolId').mockImplementation()
      await service.findLatestHdfForSchool(dfeNumber)
      expect(schoolDataService.sqlFindOneByDfeNumber).toHaveBeenCalledWith(dfeNumber)
    })

    test('returns null if the school is not found', async () => {
      jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue(undefined)
      const res = await service.findLatestHdfForSchool(dfeNumber)
      expect(res).toBeNull()
    })

    test('find the latest hdf and returns it', async () => {
      jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue(schoolMock)
      jest.spyOn(headteacherDeclarationDataService, 'sqlFindLatestHdfBySchoolId').mockResolvedValue(hdfMock)
      const res = await service.findLatestHdfForSchool(dfeNumber)
      expect(res).toEqual(hdfMock)
      expect(headteacherDeclarationDataService.sqlFindLatestHdfBySchoolId).toHaveBeenCalledWith(schoolMock.id, false)
    })
  })

  describe('#isHdfSubmittedForCurrentCheck', () => {
    const dfeNumber = 9991999
    const service = require('../../../services/headteacher-declaration.service')

    test('calls isHdfSubmittedForCheck', async () => {
      const checkWindowId = 1
      jest.spyOn(service, 'isHdfSubmittedForCheck').mockImplementation()
      await service.isHdfSubmittedForCurrentCheck(dfeNumber, checkWindowId)
      expect(service.isHdfSubmittedForCheck).toHaveBeenCalledWith(dfeNumber, checkWindowId)
    })

    test('returns false if a check window id is not provided', async () => {
      const res = await service.isHdfSubmittedForCurrentCheck(dfeNumber)
      expect(res).toBeFalsy()
    })
  })

  describe('#isHdfSubmittedForCheck', () => {
    const dfeNumber = 9991999
    const service = require('../../../services/headteacher-declaration.service')

    test('throws an error when no dfeNumber is provided', async () => {
      await expect(service.isHdfSubmittedForCheck(null, 1)).rejects.toThrow('schoolId and checkWindowId are required')
    })

    test('throws an error when no checkWindowId is provided', async () => {
      await expect(service.isHdfSubmittedForCheck(dfeNumber, null)).rejects.toThrow('schoolId and checkWindowId are required')
    })

    test('calls findHdfForCheck', async () => {
      jest.spyOn(headteacherDeclarationDataService, 'sqlFindHdfForCheck').mockResolvedValue(hdfMock)
      await service.isHdfSubmittedForCheck(dfeNumber, 1)
      expect(headteacherDeclarationDataService.sqlFindHdfForCheck).toHaveBeenCalledWith(dfeNumber, 1)
    })

    test('returns false if there isnt a current HDF for the school', async () => {
      jest.spyOn(headteacherDeclarationDataService, 'sqlFindHdfForCheck').mockResolvedValue(undefined)
      const res = await service.isHdfSubmittedForCheck(dfeNumber, 1)
      expect(res).toBeFalsy()
    })

    test('returns true if there is a valid HDF for the school', async () => {
      jest.spyOn(headteacherDeclarationDataService, 'sqlFindHdfForCheck').mockResolvedValue(hdfMock)
      const res = await service.isHdfSubmittedForCheck(dfeNumber, 1)
      expect(res).toBeTruthy()
    })

    test('returns false if the HDF is invalid', async () => {
      const invalidHdf = R.assoc('signedDate', null, hdfMock)
      jest.spyOn(headteacherDeclarationDataService, 'sqlFindHdfForCheck').mockResolvedValue(invalidHdf)
      const res = await service.isHdfSubmittedForCheck(dfeNumber, 1)
      expect(res).toBeFalsy()
    })
  })

  describe('findPupilsForSchool', () => {
    const schoolId = 123
    const service = require('../../../services/headteacher-declaration.service')

    test('throws an error when no schoolId is provided', async () => {
      await expect(service.findPupilsForSchool(null)).rejects.toThrow('schoolId is required')
    })

    test('finds the pupils using the schoolId', async () => {
      jest.spyOn(pupilStatusService, 'getPupilStatusData').mockImplementation()
      await service.findPupilsForSchool(schoolId)
      expect(pupilStatusService.getPupilStatusData).toHaveBeenCalledWith(schoolId)
    })
  })

  describe('findPupilBySlugAndSchoolId', () => {
    const urlSlug = 'xxx-xxx-xxx-xxx'
    const schoolId = 1
    const service = require('../../../services/headteacher-declaration.service')

    test('throws an error when no urlSlug is provided', async () => {
      await expect(service.findPupilBySlugAndSchoolId(null, schoolId)).rejects.toThrow('urlSlug param is required')
    })

    test('throws an error when no schoolId is provided', async () => {
      await expect(service.findPupilBySlugAndSchoolId(urlSlug, null)).rejects.toThrow('schoolId param is required')
    })

    test('finds the pupil using the urlSlug and schoolId', async () => {
      jest.spyOn(pupilStatusDataService, 'sqlFindOnePupilFullStatus').mockResolvedValue({})
      jest.spyOn(settingsService, 'get').mockResolvedValue({ checkTimeLimit: 30 })
      jest.spyOn(pupilStatusService, 'addStatus').mockImplementation()
      await service.findPupilBySlugAndSchoolId(urlSlug, schoolId)
      expect(pupilStatusDataService.sqlFindOnePupilFullStatus).toHaveBeenCalledWith(urlSlug, schoolId)
    })
  })

  describe('updatePupilsAttendanceCode', () => {
    const pupilIds = [1]
    const userId = 1
    const attendanceCode = 'XXX'
    const schoolId = 42
    const service = require('../../../services/headteacher-declaration.service')

    beforeEach(() => {
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByIds').mockResolvedValue()
    })

    test('throws an error when no pupilIds are provided', async () => {
      await expect(service.updatePupilsAttendanceCode(null, attendanceCode, userId, schoolId)).rejects.toThrow('pupilIds, code and userId are required')
    })

    test('throws an error when no code is provided', async () => {
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      await expect(service.updatePupilsAttendanceCode(pupilIds, null, userId, schoolId)).rejects.toThrow('pupilIds, code and userId are required')
    })

    test('throws an error when no userId is provided', async () => {
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      await expect(service.updatePupilsAttendanceCode(pupilIds, attendanceCode, null, schoolId)).rejects.toThrow('pupilIds, code and userId are required')
    })

    test('throws an error when at least one pupil is frozen', async () => {
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByIds').mockRejectedValue(new Error('frozen'))
      await expect(service.updatePupilsAttendanceCode(pupilIds, attendanceCode, userId, schoolId)).rejects.toThrow('frozen')
    })

    test('throws an error when an invalid attendance code is provided', async () => {
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      jest.spyOn(attendanceCodeDataService, 'sqlFindOneAttendanceCodeByCode').mockImplementation(() => {
        throw new Error('Attendance code not found')
      })
      await expect(service.updatePupilsAttendanceCode(pupilIds, attendanceCode, userId, schoolId)).rejects.toThrow('Attendance code not found')
    })

    test('calls pupilAttendanceDataService.sqlUpdateBatch', async () => {
      const attendanceCodeMock = { id: 99 }
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      jest.spyOn(attendanceCodeDataService, 'sqlFindOneAttendanceCodeByCode').mockResolvedValue(attendanceCodeMock)
      jest.spyOn(pupilAttendanceDataService, 'sqlUpdateBatch').mockResolvedValue('Mock result')
      await service.updatePupilsAttendanceCode(pupilIds, attendanceCode, userId, schoolId)
      expect(attendanceCodeDataService.sqlFindOneAttendanceCodeByCode).toHaveBeenCalledWith(attendanceCode)
      expect(pupilAttendanceDataService.sqlUpdateBatch).toHaveBeenCalledWith(pupilIds, attendanceCodeMock.id, userId)
    })

    test('drops the school results cache', async () => {
      const attendanceCodeMock = { id: 99 }
      jest.spyOn(attendanceCodeDataService, 'sqlFindOneAttendanceCodeByCode').mockResolvedValue(attendanceCodeMock)
      jest.spyOn(pupilAttendanceDataService, 'sqlUpdateBatch').mockResolvedValue('Mock result')
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      await service.updatePupilsAttendanceCode(pupilIds, attendanceCode, userId, schoolId)
      expect(redisCacheService.drop).toHaveBeenCalled()
    })
  })

  describe('soft delete hdf signing', () => {
    test('throws an error if schoolId undefined', async () => {
      await expect(service.softDeleteHdfSigning(undefined, 1)).rejects.toThrow('schoolId and userId are required')
    })

    test('throws an error if userId undefined', async () => {
      await expect(service.softDeleteHdfSigning(1, undefined)).rejects.toThrow('schoolId and userId are required')
    })

    test('calls data service to soft delete if arguments are valid', async () => {
      jest.spyOn(headteacherDeclarationDataService, 'sqlSoftDeleteHdfEntry').mockResolvedValue()
      await service.softDeleteHdfSigning(1, 1)
      expect(headteacherDeclarationDataService.sqlSoftDeleteHdfEntry).toHaveBeenCalled()
    })
  })

  describe('undo soft delete hdf signing', () => {
    test('throws an error if schoolId undefined', async () => {
      await expect(service.undoSoftDeleteHdfSigning(undefined, 1)).rejects.toThrow('schoolId and userId are required')
    })

    test('throws an error if userId undefined', async () => {
      await expect(service.undoSoftDeleteHdfSigning(1, undefined)).rejects.toThrow('schoolId and userId are required')
    })

    test('calls data service to undo soft delete if arguments are valid', async () => {
      jest.spyOn(headteacherDeclarationDataService, 'sqlUndoSoftDeleteHdfEntry').mockResolvedValue()
      await service.undoSoftDeleteHdfSigning(1, 1)
      expect(headteacherDeclarationDataService.sqlUndoSoftDeleteHdfEntry).toHaveBeenCalled()
    })
  })

  describe('hard delete hdf signing', () => {
    test('throws an error if schoolId undefined', async () => {
      await expect(service.hardDeleteHdfSigning(undefined)).rejects.toThrow('schoolId is required')
    })

    test('calls data service to hard delete if arguments are valid', async () => {
      jest.spyOn(headteacherDeclarationDataService, 'sqlHardDeleteHdfEntry').mockResolvedValue()
      await service.hardDeleteHdfSigning(123)
      expect(headteacherDeclarationDataService.sqlHardDeleteHdfEntry).toHaveBeenCalled()
    })
  })
})
