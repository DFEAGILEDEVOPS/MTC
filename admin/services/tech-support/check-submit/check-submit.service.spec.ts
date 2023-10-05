import { CheckSubmitDataService } from './check-submit.data.service'
import { CheckSubmitService as sut } from './check-submit.service'

describe('Check Submit Service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('submitV3CheckPayload', () => {
    test('if message undefined, sends empty string', async () => {
      jest.spyOn(CheckSubmitDataService, 'submitCheckMessageV3').mockImplementation()
      const payload = undefined
      await sut.submitV3CheckPayload(payload)
      expect(CheckSubmitDataService.submitCheckMessageV3).toHaveBeenCalledWith('')
    })

    test('sends message as-is to queue', async () => {
      jest.spyOn(CheckSubmitDataService, 'submitCheckMessageV3').mockImplementation()
      const payload = 'lsdkfjsdfkjdskfjsd'
      await sut.submitV3CheckPayload(payload)
      expect(CheckSubmitDataService.submitCheckMessageV3).toHaveBeenCalledWith(payload)
    })
  })
})
