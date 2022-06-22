import { PupilAnnulmentDataService } from './pupil-annulment.data.service'
import { PupilAnnulmentService } from './pupil-annulment.service'
const attendanceService = require('../../attendance.service')

describe('pupil annulment service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('apply annulment', () => {
    test('error is thrown if pupil identifier is not specified', async () => {
      const pupilUrlSlug = undefined
      await expect(PupilAnnulmentService.applyAnnulment(pupilUrlSlug, 1, 2)).rejects.toThrow('pupilUrlSlug is required')
    })

    test('error is thrown if pupil identifier is invalid', async () => {
      const invalidUuid = 'sdlfjsdlfkjdskfljsdfkljsd'
      await expect(PupilAnnulmentService.applyAnnulment(invalidUuid, 1, 2)).rejects.toThrow('a valid uuid is required for pupilUrlSlug')
    })

    test('pupil should be frozen before applying annulment attendance code', async () => {
      const pupilUrlSlug = '686bf762-35f4-45ce-aedf-f3ba01872663'
      const serviceManagerUserId = 555
      const pupilSchoolId = 345
      jest.spyOn(attendanceService, 'updatePupilAttendanceBySlug').mockImplementation()
      jest.spyOn(PupilAnnulmentDataService, 'setAnnulmentByUrlSlug').mockImplementation()
      await PupilAnnulmentService.applyAnnulment(pupilUrlSlug, pupilSchoolId, serviceManagerUserId)
      expect(PupilAnnulmentDataService.setAnnulmentByUrlSlug).toHaveBeenCalledWith(pupilUrlSlug)
      // TODO refactor...
      expect(attendanceService.updatePupilAttendanceBySlug).toHaveBeenCalledWith([pupilUrlSlug],
         PupilAnnulmentService.annulmentCode, serviceManagerUserId, pupilSchoolId)
    })
  })

  describe('remove annulment', () => {
    test('error is thrown if pupil identifier is not specified', async () => {
      const pupilUrlSlug = undefined
      await expect(PupilAnnulmentService.removeAnnulment(pupilUrlSlug, 1, false)).rejects.toThrow('pupilUrlSlug is required')
    })

    test('error is thrown if pupil identifier is invalid', async () => {
      const invalidUuid = 'sdlfjsdlfkjdskfljsdfkljsd'
      await expect(PupilAnnulmentService.removeAnnulment(invalidUuid, 1, false)).rejects.toThrow('a valid uuid is required for pupilUrlSlug')
    })

    test('frozen status is preserved if specified', async () => {
      const pupilUrlSlug = '30fd51ab-0c40-4da4-8be5-99360f8a8829'
      const pupilSchoolId = 456
      jest.spyOn(attendanceService, 'unsetAttendanceCode').mockImplementation()
      jest.spyOn(PupilAnnulmentDataService, 'undoAnnulmentByUrlSlug').mockImplementation()
      await PupilAnnulmentService.removeAnnulment(pupilUrlSlug, pupilSchoolId, true)
      expect(attendanceService.unsetAttendanceCode).toHaveBeenCalledWith(pupilUrlSlug, pupilSchoolId)
    })

    test('pupil is thawed if preservation flag is not true', async () => {
      const pupilUrlSlug = '21fd51ab-0c40-4da4-8be5-97360f8a4829'
      const pupilSchoolId = 4545
      jest.spyOn(attendanceService, 'unsetAttendanceCode').mockImplementation()
      jest.spyOn(PupilAnnulmentDataService, 'undoAnnulmentByUrlSlug').mockImplementation()
      await PupilAnnulmentService.removeAnnulment(pupilUrlSlug, pupilSchoolId, false)
      expect(PupilAnnulmentDataService.undoAnnulmentByUrlSlug).toHaveBeenCalledWith(pupilUrlSlug)
      expect(attendanceService.unsetAttendanceCode).toHaveBeenCalledWith(pupilUrlSlug, pupilSchoolId)
    })
  })
})
