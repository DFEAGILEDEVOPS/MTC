import moment = require('moment')
import { IPupilLoginDataService } from './pupil-login.data.service'
import { PupilLoginService, IPupilLoginMessage } from './pupil-login.service'

let sut: PupilLoginService
let dataServiceMock: IPupilLoginDataService

const DataServiceMock = jest.fn<IPupilLoginDataService, any>(() => ({
  updateCheckWithLoginTimestamp: jest.fn()
}))

describe('pupil-login.service', () => {
  beforeEach(() => {
    dataServiceMock = new DataServiceMock()
    sut = new PupilLoginService(dataServiceMock)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('error is thrown if message version is not supported', async () => {
    const message: IPupilLoginMessage = {
      version: 2,
      checkCode: 'the-check-code',
      loginAt: moment()
    }
    try {
      await sut.process(message)
      fail('error should have been thrown')
    } catch (error) {
      expect(error.message).toBe(`pupil-login message version:${message.version} unsupported`)
    }
  })

  test('data service called if message version is supported', async () => {
    const message: IPupilLoginMessage = {
      version: 1,
      checkCode: 'the-check-code',
      loginAt: moment()
    }
    await sut.process(message)
    expect(dataServiceMock.updateCheckWithLoginTimestamp).toHaveBeenCalledWith(message.checkCode, message.loginAt)
  })
})
