import * as CheckValidator from './check-validator.v1'
import { IAsyncTableService, TableStorageEntity } from '../../azure/storage-helper'
import { ReceivedCheckTableEntity, ValidateCheckMessageV1, MarkCheckMessageV1 } from '../../schemas/models'
import { ILogger } from '../../common/logger'
import checkSchema from '../../schemas/complete-check.v1.json'
import { ICompressionService } from '../../common/compression-service'
import * as uuid from 'uuid'
import moment from 'moment'
import { CheckNotificationType } from '../../schemas/check-notification-message'

const TableServiceMock = jest.fn<IAsyncTableService, any>(() => ({
  replaceEntityAsync: jest.fn(async (): Promise<TableStorageEntity> => {
    return {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4()
    }
  }),

  queryEntitiesAsync: jest.fn(async (): Promise<TableStorageEntity[]> => {
    return [
      {
        PartitionKey: uuid.v4(),
        RowKey: uuid.v4()
      }, {
        PartitionKey: uuid.v4(),
        RowKey: uuid.v4()
      }
    ]
  }),

  deleteEntityAsync: jest.fn(async (): Promise<any> => { return Promise.resolve('mock') }),
  insertEntityAsync: jest.fn(async (): Promise<any> => { return Promise.resolve({}) }),
  retrieveEntityAsync: jest.fn(async (): Promise<any> => { return Promise.resolve({}) })
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
    jest.spyOn(tableServiceMock, 'replaceEntityAsync').mockImplementation(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
      return {
        PartitionKey: uuid.v4(),
        RowKey: uuid.v4()
      }
    })
    const functionBindings: CheckValidator.ICheckValidatorFunctionBindings = {
      receivedCheckTable: [{}],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBe('message is missing [archive] property')
    expect(actualEntity.isValid).toBe(false)
  })

  test('archive is decompressesed when archive property present', async () => {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
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
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }
    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'replaceEntityAsync').mockImplementation(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
      return {
        PartitionKey: uuid.v4(),
        RowKey: uuid.v4()
      }
    })
    jest.spyOn(compressionServiceMock, 'decompress').mockImplementation(() => {
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
    expect(actualEntity.processingError).toBe('submitted check is missing the following properties: answers,audit,checkCode,config,inputs,pupil,questions,school,tokens')
    expect(actualEntity.isValid).toBe(false)
  })

  test('validation errors are reported to check notification queue', async () => {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      PartitionKey: validateReceivedCheckQueueMessage.schoolUUID,
      RowKey: validateReceivedCheckQueueMessage.checkCode,
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }

    jest.spyOn(tableServiceMock, 'replaceEntityAsync').mockImplementation()
    jest.spyOn(compressionServiceMock, 'decompress').mockImplementation(() => {
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
    expect(functionBindings.checkNotificationQueue).toHaveLength(1)
    const validationFailureMessage = functionBindings.checkNotificationQueue[0]
    expect(validationFailureMessage.checkCode).toStrictEqual(validateReceivedCheckQueueMessage.checkCode)
    expect(validationFailureMessage.notificationType).toBe(CheckNotificationType.checkInvalid)
    expect(validationFailureMessage.version).toBe(1)
  })

  test('submitted check with no validation errors is marked as valid', async () => {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }
    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'replaceEntityAsync').mockImplementation(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
      return {
        PartitionKey: uuid.v4(),
        RowKey: uuid.v4()
      }
    })
    jest.spyOn(compressionServiceMock, 'decompress').mockImplementation(() => {
      return JSON.stringify(checkSchema)
    })
    const functionBindings: CheckValidator.ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBeUndefined()
    expect(actualEntity.isValid).toBe(true)
  })

  test('submitted check with no validation errors has answers added to receivedCheck entity', async () => {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }
    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'replaceEntityAsync').mockImplementation(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
      return {
        PartitionKey: uuid.v4(),
        RowKey: uuid.v4()
      }
    })
    jest.spyOn(compressionServiceMock, 'decompress').mockImplementation(() => {
      return JSON.stringify(checkSchema)
    })
    const functionBindings: CheckValidator.ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBeUndefined()
    expect(actualEntity.answers).toStrictEqual(JSON.stringify(checkSchema.answers))
  })

  test('check marking message is created and added to output binding array', async () => {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }
    jest.spyOn(compressionServiceMock, 'decompress').mockImplementation(() => {
      return JSON.stringify(checkSchema)
    })
    const functionBindings: CheckValidator.ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
    expect(functionBindings.checkMarkingQueue).toHaveLength(1)
    const checkMarkingMessage: MarkCheckMessageV1 = functionBindings.checkMarkingQueue[0]
    expect(checkMarkingMessage.checkCode).toStrictEqual(validateReceivedCheckQueueMessage.checkCode)
    expect(checkMarkingMessage.schoolUUID).toStrictEqual(validateReceivedCheckQueueMessage.schoolUUID)
    expect(checkMarkingMessage.version).toBe(1)
  })
})
