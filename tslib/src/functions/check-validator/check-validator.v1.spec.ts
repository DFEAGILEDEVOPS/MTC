import * as CheckValidator from './check-validator.v1'
import { IAsyncTableService } from '../../azure/storage-helper'
import { ValidateCheckMessageV1, ReceivedCheck, MarkCheckMessageV1 } from '../../schemas/models'
import { ILogger } from '../../common/logger'
import checkSchema from '../../schemas/complete-check.v1.json'
import { ICompressionService } from '../../common/compression-service'
import * as uuid from 'uuid'
import moment from 'moment'
import { CheckNotificationType } from '../check-notifier/check-notification-message'

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
  version: 1
}

let sut: CheckValidator.CheckValidatorV1
let loggerMock: ILogger
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
      version: 1
    }
  })

  test('subject under test should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('error should be thrown when receivedCheck reference is an empty array', async () => {
    try {
      const functionBindings: CheckValidator.ICheckValidatorFunctionBindings = {
        receivedCheckTable: [],
        checkMarkingQueue: [],
        checkNotificationQueue: []
      }
      await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
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
    const functionBindings: CheckValidator.ICheckValidatorFunctionBindings = {
      receivedCheckTable: [{}],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
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
    const functionBindings: CheckValidator.ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
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
    const functionBindings: CheckValidator.ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.validationError).toBe('submitted check is missing the following properties: answers,audit,checkCode,config,inputs,pupil,questions,school,tokens')
    expect(actualEntity.isValid).toBe(false)
  })

  test('validation errors are reported to check notification queue', async () => {

    const receivedCheckEntity: ReceivedCheck = {
      PartitionKey: validateReceivedCheckQueueMessage.schoolUUID,
      RowKey: validateReceivedCheckQueueMessage.checkCode,
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }

    tableServiceMock.replaceEntityAsync = jest.fn()
    compressionServiceMock.decompress = jest.fn((input: string) => {
      return JSON.stringify({
        foo: 'bar'
      })
    })
    const functionBindings: CheckValidator.ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
    expect(functionBindings.checkNotificationQueue).toBeDefined()
    expect(functionBindings.checkNotificationQueue.length).toBe(1)
    const validationFailureMessage = functionBindings.checkNotificationQueue[0]
    expect(validationFailureMessage.checkCode).toEqual(validateReceivedCheckQueueMessage.checkCode)
    expect(validationFailureMessage.notificationType).toBe(CheckNotificationType.checkInvalid)
    expect(validationFailureMessage.version).toBe(1)
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
    const functionBindings: CheckValidator.ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.validationError).toBeUndefined()
    expect(actualEntity.isValid).toBe(true)
  })

  test('submitted check with no validation errors has answers added to receivedCheck entity', async () => {
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
    const functionBindings: CheckValidator.ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.validationError).toBeUndefined()
    expect(actualEntity.answers).toEqual(JSON.stringify(checkSchema.answers))
  })

  test('check marking message is created and added to output binding array', async () => {
    const receivedCheckEntity: ReceivedCheck = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }
    compressionServiceMock.decompress = jest.fn((input: string) => {
      return JSON.stringify(checkSchema)
    })
    const functionBindings: CheckValidator.ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
    expect(functionBindings.checkMarkingQueue.length).toBe(1)
    const checkMarkingMessage: MarkCheckMessageV1 = functionBindings.checkMarkingQueue[0]
    expect(checkMarkingMessage.checkCode).toEqual(validateReceivedCheckQueueMessage.checkCode)
    expect(checkMarkingMessage.schoolUUID).toEqual(validateReceivedCheckQueueMessage.schoolUUID)
    expect(checkMarkingMessage.version).toBe(1)

  })
})
