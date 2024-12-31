'use strict'

const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilMock = require('../mocks/pupil')
const pupilAttendanceDataService = require('../../../services/data-access/pupil-attendance.data.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')

const service = require('../../../services/attendance.service')
const attendanceCodeDataService = require('../../../services/data-access/attendance-code.data.service')
const { PupilFrozenService } = require('../../../services/pupil-frozen/pupil-frozen.service')

describe('attendanceService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('updatePupilAttendanceBySlug', () => {
    test('calls the data service', async () => {
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      const slugs = ['slug1', 'slug2', 'slug3']
      const code = 'ABSNT'
      const userId = 1
      const schoolId = 7
      const role = 'TEACHER'
      jest.spyOn(pupilAttendanceDataService, 'markAsNotAttending').mockImplementation()
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockImplementation()
      await service.updatePupilAttendanceBySlug(slugs, code, userId, schoolId, role)
      expect(pupilAttendanceDataService.markAsNotAttending).toHaveBeenCalled()
    })

    test('throws an error if any pupils are frozen', async () => {
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockImplementation(() => {
        throw new Error('frozen')
      })
      const slugs = ['slug1', 'slug2', 'slug3']
      const code = 'ABSNT'
      const userId = 1
      const schoolId = 7
      const role = 'TEACHER'
      await expect(service.updatePupilAttendanceBySlug(slugs, code, userId, schoolId, role)).rejects.toThrow('frozen')
    })
  })

  describe('unsetAttendanceCode', () => {
    const pupilSlug = 'slug1'
    const schoolId = 9991999
    const userId = 12345
    const role = 'TEACHER'

    test('throws if pupilSlug is not defined', async () => {
      await expect(service.unsetAttendanceCode(undefined, schoolId, userId, role)).rejects.toThrow('pupilSlug is not defined')
    })

    test('throws if schoolId is not defined', async () => {
      await expect(service.unsetAttendanceCode(pupilSlug, undefined, userId, role)).rejects.toThrow('schoolId is not a number')
    })

    test('throws if userId is not defined', async () => {
      await expect(service.unsetAttendanceCode(pupilSlug, schoolId, undefined, role)).rejects.toThrow('userId is not a number')
    })

    test('throws if role is not defined', async () => {
      await expect(service.unsetAttendanceCode(pupilSlug, schoolId, userId, undefined)).rejects.toThrow('role is not defined')
    })

    test('makes a call to get the pupil', async () => {
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').mockResolvedValue({})
      jest.spyOn(pupilAttendanceDataService, 'sqlDeleteOneByPupilId').mockImplementation()
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      await expect(service.unsetAttendanceCode(pupilSlug, schoolId, userId, role)).resolves.not.toThrow()
      expect(pupilDataService.sqlFindOneBySlugAndSchool).toHaveBeenCalled()
    })

    test('throws if the pupil is not found', async () => {
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockImplementation()
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      await expect(service.unsetAttendanceCode(pupilSlug, schoolId, userId, role)).rejects.toThrow(`Pupil with id ${pupilSlug} and school ${schoolId} not found`)
    })

    test('throws if the pupil is frozen', async () => {
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockImplementation(() => {
        throw new Error('frozen')
      })
      await expect(service.unsetAttendanceCode(pupilSlug, schoolId, userId, role)).rejects.toThrow('frozen')
    })

    test('makes a call to delete the pupilAttendance record if the pupil is found', async () => {
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').mockResolvedValue(pupilMock)
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockImplementation()
      jest.spyOn(pupilAttendanceDataService, 'sqlDeleteOneByPupilId').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      await service.unsetAttendanceCode(pupilSlug, schoolId, userId, role)
      expect(pupilAttendanceDataService.sqlDeleteOneByPupilId).toHaveBeenCalledWith(pupilMock.id, userId, role)
    })
  })

  describe('hasAttendance', () => {
    describe('for live env', () => {
      test('returns valid if pupil has any attendance', async () => {
        jest.spyOn(pupilAttendanceDataService, 'findOneByPupilId').mockResolvedValue({ id: 'id', code: 'A' })
        const result = await service.hasAttendance('id', 'live')
        expect(result).toBe(true)
      })

      test('returns invalid if there is no attendance', async () => {
        jest.spyOn(pupilAttendanceDataService, 'findOneByPupilId').mockResolvedValue(undefined)
        const result = await service.hasAttendance('id', 'live')
        expect(result).toBe(false)
      })
    })

    describe('for familiarisation env', () => {
      test('returns valid if pupil has left school attendance', async () => {
        jest.spyOn(pupilAttendanceDataService, 'findOneByPupilId').mockResolvedValue({ id: 'id', code: 'LEFTT' })
        const result = await service.hasAttendance('id', 'familiarisation')
        expect(result).toBe(true)
      })

      test('returns invalid if pupil has other attendance than left school', async () => {
        jest.spyOn(pupilAttendanceDataService, 'findOneByPupilId').mockResolvedValue({ id: 'id', code: 'A' })
        const result = await service.hasAttendance('id', 'familiarisation')
        expect(result).toBe(false)
      })

      test('returns invalid if there is no attendance', async () => {
        jest.spyOn(pupilAttendanceDataService, 'findOneByPupilId').mockResolvedValue(undefined)
        const result = await service.hasAttendance('id', 'familiarisation')
        expect(result).toBe(false)
      })
    })
  })

  describe('getAttendanceCodes', () => {
    test('it sorts on the order prop', async () => {
      const attendanceData = [
        { id: 1, order: 3 },
        { id: 2, order: 2 },
        { id: 3, order: 1 }
      ]
      jest.spyOn(attendanceCodeDataService, 'sqlFindAttendanceCodes').mockResolvedValue(attendanceData)
      const actual = await service.getAttendanceCodes()
      expect(actual[0].id).toBe(3)
      expect(actual[1].id).toBe(2)
      expect(actual[2].id).toBe(1)
    })
  })
})
