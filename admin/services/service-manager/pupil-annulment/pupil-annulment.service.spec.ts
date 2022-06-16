import { PupilFrozenDataService } from '../../pupil-frozen.service/pupil-frozen.data.service'
import { PupilAnnulmentDataService } from './pupil-annulment.data.service'
import { PupilAnnulmentService } from './pupil-annulment.service'

describe('pupil annulment service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('apply annulment', () => {
    test('error is thrown if pupil identifier is not specified', async () => {
      const pupilId = undefined
      await expect(PupilAnnulmentService.applyAnnulment(pupilId)).rejects.toThrow('pupilId is required')
    })

    test('pupil should be frozen before applying annulment attendance code', async () => {
      const pupilId = 494
      jest.spyOn(PupilFrozenDataService, 'freezePupil').mockImplementation()
      await PupilAnnulmentService.applyAnnulment(pupilId)
      expect(PupilFrozenDataService.freezePupil).toHaveBeenCalledWith(pupilId)
      throw new Error('todo: expect call to attendance service')
    })
  })

  describe('remove annulment', () => {
    test.todo('error is thrown if pupil identifier is not specified')
    test.todo('error is thrown if pupil is not found')
    test.todo('frozen status is preserved if specified')
  })
})
