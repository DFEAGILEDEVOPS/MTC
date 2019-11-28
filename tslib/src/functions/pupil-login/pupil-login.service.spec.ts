import moment = require('moment')
import { IPupilLoginDataService } from './pupil-login.data.service'
import { PupilLoginService, IPupilLoginMessage, IPupilLoginFunctionBindings, IPupilEvent } from './pupil-login.service'

let sut: PupilLoginService
let dataServiceMock: IPupilLoginDataService
let bindings: IPupilLoginFunctionBindings = {
  pupilEventTable: []
}

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
      await sut.process(message, bindings)
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
    await sut.process(message, bindings)
    expect(dataServiceMock.updateCheckWithLoginTimestamp).toHaveBeenCalledWith(message.checkCode, message.loginAt)
  })

  test('entry is added to pupilEvent table', async () => {
    const message: IPupilLoginMessage = {
      version: 1,
      checkCode: 'the-check-code',
      loginAt: moment()
    }
    await sut.process(message, bindings)
    expect(bindings.pupilEventTable.length).toBe(1)
    const entry = bindings.pupilEventTable[0] as IPupilEvent
    expect(entry.PartitionKey).toEqual(message.checkCode)
    expect(entry.RowKey).toBeDefined()
    expect(entry.eventType).toEqual('pupil-login')
    expect(entry.payload).toEqual(message)
    expect(entry.processedAt).toBeDefined()
  })
})
