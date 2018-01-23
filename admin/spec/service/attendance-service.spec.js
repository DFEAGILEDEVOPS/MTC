'use strict'
/* globals describe it spyOn expect fail */

const pupilDataService = require('../../services/data-access/pupil.data.service')
const attendanceCodeDataService = require('../../services/data-access/attendance-code.data.service')
const pupilMock = require('../mocks/pupil')
const pupilAttendanceDataService = require('../../services/data-access/pupil-attendance.data.service')
const attendanceCodeMock = require('../mocks/attendance-codes')[1]

const service = require('../../services/attendance.service')

describe('attendanceService', () => {
  describe('#updatePupilAttendanceBySlug', () => {
    const slugs = ['slug1', 'slug2', 'slug3']
    const code = 'ABSNT'
    const userId = 1

    it('makes a call to get the pupils', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsByUrlSlug').and.returnValue(Promise.resolve([ pupilMock ]))
      spyOn(attendanceCodeDataService, 'sqlFindOneAttendanceCodeByCode').and.returnValue(Promise.resolve(attendanceCodeMock))
      spyOn(pupilAttendanceDataService, 'findByPupilIds').and.returnValue(Promise.resolve([]))
      spyOn(pupilAttendanceDataService, 'sqlUpdateBatch')
      spyOn(pupilAttendanceDataService, 'sqlInsertBatch')
      await service.updatePupilAttendanceBySlug(slugs, code, userId)
      expect(pupilDataService.sqlFindPupilsByUrlSlug).toHaveBeenCalled()
    })

    it('throws an error if no pupils are returned', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsByUrlSlug').and.returnValue(Promise.resolve(undefined))
      spyOn(attendanceCodeDataService, 'sqlFindOneAttendanceCodeByCode').and.returnValue(Promise.resolve(attendanceCodeMock))
      spyOn(pupilAttendanceDataService, 'findByPupilIds').and.returnValue(Promise.resolve([]))
      spyOn(pupilAttendanceDataService, 'sqlUpdateBatch')
      spyOn(pupilAttendanceDataService, 'sqlInsertBatch')
      try {
        await service.updatePupilAttendanceBySlug(slugs, code, userId)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Pupils not found')
      }
    })

    it('makes a call to lookup the attendance code', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsByUrlSlug').and.returnValue(Promise.resolve([ pupilMock ]))
      spyOn(attendanceCodeDataService, 'sqlFindOneAttendanceCodeByCode').and.returnValue(Promise.resolve(attendanceCodeMock))
      spyOn(pupilAttendanceDataService, 'findByPupilIds').and.returnValue(Promise.resolve([]))
      spyOn(pupilAttendanceDataService, 'sqlUpdateBatch')
      spyOn(pupilAttendanceDataService, 'sqlInsertBatch')
      await service.updatePupilAttendanceBySlug(slugs, code, userId)
      expect(attendanceCodeDataService.sqlFindOneAttendanceCodeByCode).toHaveBeenCalledWith(code)
    })

    it('throws if it is unable to lookup the attendance code provided', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsByUrlSlug').and.returnValue(Promise.resolve([ pupilMock ]))
      spyOn(attendanceCodeDataService, 'sqlFindOneAttendanceCodeByCode').and.returnValue(Promise.resolve(undefined))
      spyOn(pupilAttendanceDataService, 'findByPupilIds').and.returnValue(Promise.resolve([]))
      spyOn(pupilAttendanceDataService, 'sqlUpdateBatch')
      spyOn(pupilAttendanceDataService, 'sqlInsertBatch')
      try {
        await service.updatePupilAttendanceBySlug(slugs, code, userId)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe(`attendanceCode not found: ${code}`)
      }
    })

    it('makes a call to find out if any pupils already have an attendance code', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsByUrlSlug').and.returnValue(Promise.resolve([ pupilMock ]))
      spyOn(attendanceCodeDataService, 'sqlFindOneAttendanceCodeByCode').and.returnValue(Promise.resolve(attendanceCodeMock))
      spyOn(pupilAttendanceDataService, 'findByPupilIds').and.returnValue(Promise.resolve([]))
      spyOn(pupilAttendanceDataService, 'sqlUpdateBatch')
      spyOn(pupilAttendanceDataService, 'sqlInsertBatch')
      await service.updatePupilAttendanceBySlug(slugs, code, userId)
      expect(pupilAttendanceDataService.findByPupilIds).toHaveBeenCalled()
    })

    it('it inserts pupils that dont already have an attendance code', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsByUrlSlug').and.returnValue(Promise.resolve([ pupilMock ]))
      spyOn(attendanceCodeDataService, 'sqlFindOneAttendanceCodeByCode').and.returnValue(Promise.resolve(attendanceCodeMock))

      // Returning an empty array means there arent any pupils that already have a
      // pupilAttendance record, so all of them will be an update
      spyOn(pupilAttendanceDataService, 'findByPupilIds').and.returnValue(Promise.resolve([]))

      spyOn(pupilAttendanceDataService, 'sqlUpdateBatch')
      spyOn(pupilAttendanceDataService, 'sqlInsertBatch')
      await service.updatePupilAttendanceBySlug(slugs, code, userId)
      expect(pupilAttendanceDataService.sqlInsertBatch).toHaveBeenCalledWith([pupilMock.id], attendanceCodeMock.id, userId)
      expect(pupilAttendanceDataService.sqlUpdateBatch).not.toHaveBeenCalled()
    })

    it('it update pupils that already have an attendance code', async () => {
      const pupilAttendanceMock = { pupil_id: 42 }
      spyOn(pupilDataService, 'sqlFindPupilsByUrlSlug').and.returnValue(Promise.resolve([ pupilMock ]))
      spyOn(attendanceCodeDataService, 'sqlFindOneAttendanceCodeByCode').and.returnValue(Promise.resolve(attendanceCodeMock))
      spyOn(pupilAttendanceDataService, 'findByPupilIds').and.returnValue(Promise.resolve([pupilAttendanceMock]))
      spyOn(pupilAttendanceDataService, 'sqlUpdateBatch')
      spyOn(pupilAttendanceDataService, 'sqlInsertBatch')
      await service.updatePupilAttendanceBySlug(slugs, code, userId)
      expect(pupilAttendanceDataService.sqlUpdateBatch).toHaveBeenCalledWith([pupilMock.id], attendanceCodeMock.id, userId)
      expect(pupilAttendanceDataService.sqlInsertBatch).not.toHaveBeenCalled()
    })
  })

  describe('#unsetAttendanceCode', () => {
    const pupilSlug = 'slug1'
    const dfeNumber = 9991999

    it('makes a call to get the pupil', async () => {
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool')
      try {
        await service.unsetAttendanceCode(pupilSlug, dfeNumber)
      } catch (error) {}
      expect(pupilDataService.sqlFindOneBySlugAndSchool).toHaveBeenCalled()
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
})
