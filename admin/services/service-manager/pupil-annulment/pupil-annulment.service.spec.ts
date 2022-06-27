import { PupilAnnulmentDataService } from './pupil-annulment.data.service'
import { PupilAnnulmentService } from './pupil-annulment.service'

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

    test('data service should be called to set annulment', async () => {
      const pupilUrlSlug = '686bf762-35f4-45ce-aedf-f3ba01872663'
      const serviceManagerUserId = 555
      jest.spyOn(PupilAnnulmentDataService, 'setAnnulmentByUrlSlug').mockImplementation()
      await PupilAnnulmentService.applyAnnulment(pupilUrlSlug, serviceManagerUserId)
      expect(PupilAnnulmentDataService.setAnnulmentByUrlSlug).toHaveBeenCalledWith(pupilUrlSlug, serviceManagerUserId)
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

    test('data service is called to undo annulment', async () => {
      const pupilUrlSlug = '21fd51ab-0c40-4da4-8be5-97360f8a4829'
      const serviceManagerUserId = 4545
      jest.spyOn(PupilAnnulmentDataService, 'undoAnnulmentByUrlSlug').mockImplementation()
      await PupilAnnulmentService.removeAnnulment(pupilUrlSlug, serviceManagerUserId)
      expect(PupilAnnulmentDataService.undoAnnulmentByUrlSlug).toHaveBeenCalledWith(pupilUrlSlug, serviceManagerUserId)
    })
  })
})
