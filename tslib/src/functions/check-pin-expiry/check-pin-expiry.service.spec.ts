import { CheckPinExpiryService } from './check-pin-expiry.service'

describe('CheckPinExpiryService', () => {
  const sqlServiceMock = {
    query: jest.fn(),
    modify: jest.fn(),
    modifyWithTransaction: jest.fn()
  }

  let sut: CheckPinExpiryService

  beforeEach(() => {
    sut = new CheckPinExpiryService(sqlServiceMock)
  })

  test('instantiates an object', () => {
    expect(sut).toBeDefined()
  })

  test('has a method called process', () => {
    expect(typeof sut.process).toBe('function')
  })

  test('modifies the database', async () => {
    await sut.process()
    expect(sqlServiceMock.modify).toHaveBeenCalled()
    expect(sqlServiceMock.modify.mock.calls[0][0]).toMatch(/^DELETE FROM \[mtc_admin\]\.\[checkPin\]/)
  })
})
