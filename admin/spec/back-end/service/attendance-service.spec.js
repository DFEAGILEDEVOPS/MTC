'use strict'
/* globals describe it spyOn expect fail */

const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilMock = require('../mocks/pupil')
const pupilAttendanceDataService = require('../../../services/data-access/pupil-attendance.data.service')

const service = require('../../../services/attendance.service')

describe('attendanceService', () => {
  describe('#updatePupilAttendanceBySlug', () => {
    it('just calls the data service', async () => {
      const slugs = ['slug1', 'slug2', 'slug3']
      const code = 'ABSNT'
      const userId = 1
      const schoolId = 7
      spyOn(pupilAttendanceDataService, 'markAsNotAttending')
      await service.updatePupilAttendanceBySlug(slugs, code, userId, schoolId)
      expect(pupilAttendanceDataService.markAsNotAttending).toHaveBeenCalled()
    })
  })

  describe('#unsetAttendanceCode', () => {
    const pupilSlug = 'slug1'
    const dfeNumber = 9991999

    it('makes a call to get the pupil', async () => {
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue({})
      spyOn(pupilAttendanceDataService, 'sqlDeleteOneByPupilId').and.returnValue(Promise.resolve())
      try {
        await service.unsetAttendanceCode(pupilSlug, dfeNumber)
        expect(pupilDataService.sqlFindOneBySlugAndSchool).toHaveBeenCalled()
      } catch (error) {
        fail(error.message)
      }
    })

    it('throws if the pupil is not found', async () => {
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool')
      try {
        await service.unsetAttendanceCode(pupilSlug, dfeNumber)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe(`Pupil with id ${pupilSlug} and school ${dfeNumber} not found`)
      }
    })

    it('makes a call to delete the pupilAttendance record if the pupil is found', async () => {
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue(Promise.resolve(pupilMock))
      spyOn(pupilAttendanceDataService, 'sqlDeleteOneByPupilId').and.returnValue()
      await service.unsetAttendanceCode(pupilSlug, dfeNumber)
      expect(pupilAttendanceDataService.sqlDeleteOneByPupilId).toHaveBeenCalledWith(pupilMock.id)
    })
  })

  describe('#hasAttendance', () => {
    describe('for live env', () => {
      it('returns valid if pupil has any attendance', async () => {
        spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue({ id: 'id', code: 'A' })
        const result = await service.hasAttendance('id', 'live')
        expect(result).toBe(true)
      })

      it('returns invalid if there is no attendance', async () => {
        spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue(undefined)
        const result = await service.hasAttendance('id', 'live')
        expect(result).toBe(false)
      })
    })

    describe('for familiarisation env', () => {
      it('returns valid if pupil has left school attendance', async () => {
        spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue({ id: 'id', code: 'LEFTT' })
        const result = await service.hasAttendance('id', 'familiarisation')
        expect(result).toBe(true)
      })

      it('returns invalid if pupil has other attendance than left school', async () => {
        spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue({ id: 'id', code: 'A' })
        const result = await service.hasAttendance('id', 'familiarisation')
        expect(result).toBe(false)
      })

      it('returns invalid if there is no attendance', async () => {
        spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue(undefined)
        const result = await service.hasAttendance('id', 'familiarisation')
        expect(result).toBe(false)
      })
    })
  })
})
