import * as CheckValidator from '../../check-validator/check-validator.v1'
import { IAsyncTableService } from '../../lib/storage-helper'
import { ValidateCheckMessageV1, ReceivedCheck } from '../../typings/message-schemas'
import { ILogger } from '../../lib/ILogger'
import checkSchema from '../../messages/complete-check.v1.json'
import * as R from 'ramda'
import { ICompressionService } from '../../lib/compression-service'
import * as uuid from 'uuid'
import moment from 'moment'

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

const CompressionServiceMock = jest.fn<ICompressionService, any>(() => ({
  compress: jest.fn(),
  decompress: jest.fn()
}))

let validateReceivedCheckQueueMessage: ValidateCheckMessageV1 = {
  schoolUUID: uuid.v4(),
  checkCode: uuid.v4(),
  version: '1'
}

let sut: CheckValidator.CheckValidatorV1
let loggerMock: ILogger
let mockCheck
let tableServiceMock: IAsyncTableService
let compressionServiceMock: ICompressionService

describe('check-validator/v1', () => {
  beforeEach(() => {
    tableServiceMock = new TableServiceMock()
    compressionServiceMock = new CompressionServiceMock()
    sut = new CheckValidator.CheckValidatorV1(tableServiceMock, compressionServiceMock)
    loggerMock = new LoggerMock()
    validateReceivedCheckQueueMessage = {
      schoolUUID: 'abc',
      checkCode: 'xyz',
      version: '1'
    }
    mockCheck = R.clone(checkSchema)
  })

  test('subject under test should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('error should be thrown when receivedCheck reference is an empty array', async () => {
    try {
      const receivedCheckRef: Array<any> = []
      await sut.validate(receivedCheckRef, validateReceivedCheckQueueMessage, loggerMock)
      fail('error should have been thrown due to empty receivedCheckData')
    } catch (error) {
      expect(error.message).toBe('received check reference is empty')
    }
  })

  test('validation error is recorded on receivedCheck entity when archive property is missing', async () => {
    let actualTableName: string | undefined
    let actualEntity: any
    tableServiceMock.replaceEntityAsync = jest.fn(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })
    await sut.validate([{}], validateReceivedCheckQueueMessage, loggerMock)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.validationError).toBe('message is missing [archive] property')
    expect(actualEntity.isValid).toBe(false)
  })

  test('archive is decompressesed when archive property present', async () => {
    const receivedCheckEntity: ReceivedCheck = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }
    await sut.validate([receivedCheckEntity], validateReceivedCheckQueueMessage, loggerMock)
    expect(compressionServiceMock.decompress).toHaveBeenCalledWith('foo')
  })

  test('submitted check with missing properties are recorded as validation errors against the entity', async () => {
    const receivedCheckEntity: ReceivedCheck = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }
    let actualTableName: string | undefined
    let actualEntity: any
    tableServiceMock.replaceEntityAsync = jest.fn(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })
    compressionServiceMock.decompress = jest.fn((input: string) => {
      return JSON.stringify({
        foo: 'bar'
      })
    })
    await sut.validate([receivedCheckEntity], validateReceivedCheckQueueMessage, loggerMock)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.validationError).toBe('submitted check is missing the following properties: answers,audit,config,device,inputs,pupil,questions,school,tokens,checkCode')
    expect(actualEntity.isValid).toBe(false)
  })

  test('submitted check with no validation errors is marked as valid', async () => {
    const receivedCheckEntity: ReceivedCheck = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }
    let actualTableName: string | undefined
    let actualEntity: any
    tableServiceMock.replaceEntityAsync = jest.fn(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })
    compressionServiceMock.decompress = jest.fn((input: string) => {
      return JSON.stringify(checkSchema)
    })
    await sut.validate([receivedCheckEntity], validateReceivedCheckQueueMessage, loggerMock)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.validationError).toBeUndefined()
    expect(actualEntity.isValid).toBe(true)
    expect(loggerMock.info).toHaveBeenCalled()
  })
})
