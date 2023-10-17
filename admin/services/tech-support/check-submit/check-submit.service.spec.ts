import { CheckSubmitDataService } from './check-submit.data.service'
import { CheckSubmitService as sut } from './check-submit.service'

describe('Check Submit Service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('submitV3CheckPayload', () => {
    describe('raw text', () => {
      test('if message undefined, sends empty string', async () => {
        jest.spyOn(CheckSubmitDataService, 'submitCheckMessageV3').mockImplementation()
        const payload = undefined
        await sut.submitV3CheckPayload(false, payload)
        expect(CheckSubmitDataService.submitCheckMessageV3).toHaveBeenCalledWith('')
      })

      test('sends message as-is to queue', async () => {
        jest.spyOn(CheckSubmitDataService, 'submitCheckMessageV3').mockImplementation()
        const payload = 'lsdkfjsdfkjdskfjsd'
        await sut.submitV3CheckPayload(false, payload)
        expect(CheckSubmitDataService.submitCheckMessageV3).toHaveBeenCalledWith(payload)
      })
    })

    describe('json', () => {
      test('if message undefined, sends empty object', async () => {
        jest.spyOn(CheckSubmitDataService, 'submitCheckMessageV3').mockImplementation()
        const payload = undefined
        await sut.submitV3CheckPayload(true, payload)
        expect(CheckSubmitDataService.submitCheckMessageV3).toHaveBeenCalledWith(JSON.parse('{}'))
      })

      test('if message empty string, sends empty object', async () => {
        jest.spyOn(CheckSubmitDataService, 'submitCheckMessageV3').mockImplementation()
        const payload = ''
        await sut.submitV3CheckPayload(true, payload)
        expect(CheckSubmitDataService.submitCheckMessageV3).toHaveBeenCalledWith({})
      })

      test('converts string object to JSON for submission', async () => {
        jest.spyOn(CheckSubmitDataService, 'submitCheckMessageV3').mockImplementation()
        const payload = { foo: 'bar' }
        await sut.submitV3CheckPayload(true, JSON.stringify(payload))
        expect(CheckSubmitDataService.submitCheckMessageV3).toHaveBeenCalledWith(payload)
      })
    })
  })
})
