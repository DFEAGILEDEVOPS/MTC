/* global describe test expect jest afterEach */

const pupilAgeReasonService = require('../../../services/pupil-age-reason.service')
const pupilAgeReasonDataService = require('../../../services/data-access/pupil-age-reason.data.service')

describe('pupilAgeReasonService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('refreshPupilAgeReason', () => {
    const userId = 42

    test('it throws an error if a userId is not provided', async () => {
      await expect(pupilAgeReasonService.refreshPupilAgeReason(1, 'new reason', 'old reason')).rejects.toThrowError('missing userId')
    })

    test('calls sqlInsertPupilAgeReason if new age reason is supplied and previous does not exist', async () => {
      jest.spyOn(pupilAgeReasonDataService, 'sqlInsertPupilAgeReason').mockImplementation()
      jest.spyOn(pupilAgeReasonDataService, 'sqlUpdatePupilAgeReason').mockImplementation()
      jest.spyOn(pupilAgeReasonDataService, 'sqlRemovePupilAgeReason').mockImplementation()
      await pupilAgeReasonService.refreshPupilAgeReason(1, 'new reason', null, userId)
      expect(pupilAgeReasonDataService.sqlInsertPupilAgeReason).toHaveBeenCalled()
      expect(pupilAgeReasonDataService.sqlUpdatePupilAgeReason).not.toHaveBeenCalled()
      expect(pupilAgeReasonDataService.sqlRemovePupilAgeReason).not.toHaveBeenCalled()
    })

    test('calls sqlUpdatePupilAgeReason if new age reason is supplied and previous does exist', async () => {
      jest.spyOn(pupilAgeReasonDataService, 'sqlInsertPupilAgeReason').mockImplementation()
      jest.spyOn(pupilAgeReasonDataService, 'sqlUpdatePupilAgeReason').mockImplementation()
      jest.spyOn(pupilAgeReasonDataService, 'sqlRemovePupilAgeReason').mockImplementation()
      await pupilAgeReasonService.refreshPupilAgeReason(1, 'new reason', 'old reason', userId)
      expect(pupilAgeReasonDataService.sqlInsertPupilAgeReason).not.toHaveBeenCalled()
      expect(pupilAgeReasonDataService.sqlUpdatePupilAgeReason).toHaveBeenCalled()
      expect(pupilAgeReasonDataService.sqlRemovePupilAgeReason).not.toHaveBeenCalled()
    })

    test('calls sqlUpdatePupilAgeReason if new age reason is not supplied and previous reason exist', async () => {
      jest.spyOn(pupilAgeReasonDataService, 'sqlInsertPupilAgeReason').mockImplementation()
      jest.spyOn(pupilAgeReasonDataService, 'sqlUpdatePupilAgeReason').mockImplementation()
      jest.spyOn(pupilAgeReasonDataService, 'sqlRemovePupilAgeReason').mockImplementation()
      await pupilAgeReasonService.refreshPupilAgeReason(1, '', 'old reason', userId)
      expect(pupilAgeReasonDataService.sqlInsertPupilAgeReason).not.toHaveBeenCalled()
      expect(pupilAgeReasonDataService.sqlUpdatePupilAgeReason).not.toHaveBeenCalled()
      expect(pupilAgeReasonDataService.sqlRemovePupilAgeReason).toHaveBeenCalled()
    })
  })
})
