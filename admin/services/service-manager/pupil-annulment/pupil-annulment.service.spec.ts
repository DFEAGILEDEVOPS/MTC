import { PupilFrozenDataService } from '../../pupil-frozen.service/pupil-frozen.data.service'
import { PupilAnnulmentService } from './pupil-annulment.service'
const attendanceService = require('../../attendance.service')

describe('pupil annulment service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('apply annulment', () => {
    test('error is thrown if pupil identifier is not specified', async () => {
      const pupilUrlSlug = undefined
      await expect(PupilAnnulmentService.applyAnnulment(pupilUrlSlug, 1)).rejects.toThrow('pupilUrlSlug is required')
    })

    test('error is thrown if pupil identifier is invalid', async () => {
      const invalidUuid = 'sdlfjsdlfkjdskfljsdfkljsd'
      await expect(PupilAnnulmentService.applyAnnulment(invalidUuid, 1)).rejects.toThrow('a valid uuid is required for pupilUrlSlug')
    })

    test('pupil should be frozen before applying annulment attendance code', async () => {
      const pupilUrlSlug = '686bf762-35f4-45ce-aedf-f3ba01872663'
      jest.spyOn(attendanceService, 'updatePupilAttendanceBySlug').mockImplementation()
      jest.spyOn(PupilFrozenDataService, 'freezePupil').mockImplementation()
      await PupilAnnulmentService.applyAnnulment(pupilUrlSlug, 1)
      expect(PupilFrozenDataService.freezePupil).toHaveBeenCalledWith(pupilUrlSlug)
      expect(attendanceService.updatePupilAttendanceBySlug).toHaveBeenCalledTimes(1)
    })
  })

  describe('remove annulment', () => {
    test('error is thrown if pupil identifier is not specified', async () => {
      const pupilUrlSlug = undefined
      await expect(PupilAnnulmentService.removeAnnulment(pupilUrlSlug, 1)).rejects.toThrow('pupilUrlSlug is required')
    })

    test('error is thrown if pupil identifier is invalid', async () => {
      const invalidUuid = 'sdlfjsdlfkjdskfljsdfkljsd'
      await expect(PupilAnnulmentService.removeAnnulment(invalidUuid, 1)).rejects.toThrow('a valid uuid is required for pupilUrlSlug')
    })

    test.todo('frozen status is preserved if specified')
  })
})
