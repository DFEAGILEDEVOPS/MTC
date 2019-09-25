import * as CheckValidator from '../../check-validator/check-validator.v1'
import { IAsyncTableService } from '../../lib/storage-helper'
import { ValidateCheckMessageV1 } from '../../typings/message-schemas'
import { ILogger } from '../../lib/ILogger'

const TableServiceMock = jest.fn<IAsyncTableService, any>(() => ({
  replaceEntityAsync: jest.fn(),
  queryEntitiesAsync: jest.fn(),
  deleteEntityAsync: jest.fn(),
  insertEntityAsync: jest.fn()
}))

const LoggerMock = jest.fn<ILogger, any>(() => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  verbose: jest.fn()
}))

let sut: CheckValidator.CheckValidatorV1
let loggerMock: ILogger

describe('check-validator/v1', () => {
  beforeEach(() => {
    const tableServiceMock = new TableServiceMock()
    sut = new CheckValidator.CheckValidatorV1(tableServiceMock)
    loggerMock = new LoggerMock()
  })
  it('should be defined', () => {
    expect(sut).toBeDefined()
  })
  it('should throw an error when receivedCheckData is not provided', async () => {
    try {
      const message: ValidateCheckMessageV1 = {
        schoolUUID: 'abc',
        checkCode: 'xyz',
        version: '1'
      }
      const receivedCheckData: Array<any> = []
      await sut.validate(receivedCheckData, message, loggerMock)
      fail('error should have been thrown due to empty receivedCheckData')
    } catch (error) {
      expect(error.message).toBe('received check data is empty')
    }
  })
})
