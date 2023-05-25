import { type IPupilLoginDataService } from './pupil-login.data.service'
import { PupilLoginService, type IPupilLoginMessage, type IPupilLoginFunctionBindings, type IPupilEvent } from './pupil-login.service'

let sut: PupilLoginService
let dataServiceMock: IPupilLoginDataService
const bindings: IPupilLoginFunctionBindings = {
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
      loginAt: new Date(),
      practice: true
    }
    try {
      await sut.process(message, bindings)
      fail('error should have been thrown')
    } catch (error) {
      expect(error.message).toBe(`pupil-login message version:${message.version} unsupported`)
    }
  })

  test('data service called if live check', async () => {
    const message: IPupilLoginMessage = {
      version: 1,
      checkCode: 'the-check-code',
      loginAt: new Date(),
      practice: false
    }
    await sut.process(message, bindings)
    expect(dataServiceMock.updateCheckWithLoginTimestamp).toHaveBeenCalledWith(message.checkCode, message.loginAt)
  })

  test('data service  called if practice check', async () => {
    const message: IPupilLoginMessage = {
      version: 1,
      checkCode: 'the-check-code',
      loginAt: new Date(),
      practice: true
    }
    await sut.process(message, bindings)
    expect(dataServiceMock.updateCheckWithLoginTimestamp).toHaveBeenCalledWith(message.checkCode, message.loginAt)
  })

  test('entry is added to pupilEvent table', async () => {
    const message: IPupilLoginMessage = {
      version: 1,
      checkCode: 'the-check-code',
      loginAt: new Date(),
      practice: true
    }
    await sut.process(message, bindings)
    expect(bindings.pupilEventTable).toHaveLength(1)
    const entry = bindings.pupilEventTable[0] as IPupilEvent
    expect(entry.PartitionKey).toStrictEqual(message.checkCode)
    expect(entry.RowKey).toBeDefined()
    expect(entry.eventType).toBe('pupil-login')
    expect(entry.payload).toStrictEqual(message)
    expect(entry.processedAt).toBeDefined()
  })
})
