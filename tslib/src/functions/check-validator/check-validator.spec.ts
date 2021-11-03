import { CheckValidator, ICheckValidatorFunctionBindings } from './check-validator'
import { ReceivedCheckTableEntity, ValidateCheckMessageV1, MarkCheckMessageV1 } from '../../schemas/models'
import { ILogger } from '../../common/logger'
import { ICompressionService } from '../../common/compression-service'
import * as uuid from 'uuid'
import moment from 'moment'
import { CheckNotificationType } from '../../schemas/check-notification-message'
import { getValidatedCheck } from '../../schemas/check-schemas/validated-check'
import { ITableService } from '../../azure/table-service'
import { TableEntity } from '@azure/data-tables'

const TableServiceMock = jest.fn<ITableService, any>(() => ({
  createEntity: jest.fn(),
  getEntity: jest.fn(),
  mergeUpdateEntity: jest.fn(),
  replaceEntity: jest.fn()
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

let sut: CheckValidator
let loggerMock: ILogger
let tableServiceMock: ITableService
let compressionServiceMock: ICompressionService

describe('check-validator', () => {
  beforeEach(() => {
    tableServiceMock = new TableServiceMock()
    compressionServiceMock = new CompressionServiceMock()
    sut = new CheckValidator(tableServiceMock, compressionServiceMock)
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
      const functionBindings: ICheckValidatorFunctionBindings = {
        receivedCheckTable: [],
        checkMarkingQueue: [],
        checkNotificationQueue: []
      }
      await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
      fail('error should have been thrown due to empty receivedCheckData')
    } catch (error: any) {
      expect(error.message)
        .toBe(`check-validator: unable to find receivedCheck with partitionKey:${validateReceivedCheckQueueMessage.schoolUUID} rowKey:${validateReceivedCheckQueueMessage.checkCode}`)
    }
  })

  test('validation error is recorded on receivedCheck entity when archive property is missing', async () => {
    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: TableEntity<object>) => {
      actualTableName = table
      actualEntity = entity
    })
    jest.spyOn(tableServiceMock, 'getEntity').mockResolvedValue({
      partitionKey: 'x',
      rowKey: 'y'
    })
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [{}],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
    expect(tableServiceMock.mergeUpdateEntity).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBe('check-validator: message is missing [archive] property')
    expect(actualEntity.isValid).toBe(false)
  })

  test('archive is decompressesed when archive property present', async () => {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      partitionKey: uuid.v4(),
      rowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    jest.spyOn(tableServiceMock, 'getEntity').mockResolvedValue(receivedCheckEntity)
    await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
    expect(compressionServiceMock.decompress).toHaveBeenCalledWith('foo')
  })

  test('submitted check with missing properties are recorded as validation errors against the entity', async () => {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      partitionKey: uuid.v4(),
      rowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }
    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })
    jest.spyOn(compressionServiceMock, 'decompress').mockImplementation(() => {
      return JSON.stringify({
        foo: 'bar'
      })
    })
    jest.spyOn(tableServiceMock, 'getEntity').mockResolvedValue(receivedCheckEntity)
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
    expect(tableServiceMock.mergeUpdateEntity).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBeDefined()
    expect(actualEntity.isValid).toBe(false)
  })

  test('validation errors are reported to check notification queue', async () => {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      partitionKey: validateReceivedCheckQueueMessage.schoolUUID,
      rowKey: validateReceivedCheckQueueMessage.checkCode,
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }

    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation()
    jest.spyOn(compressionServiceMock, 'decompress').mockImplementation(() => {
      return JSON.stringify({
        foo: 'bar'
      })
    })
    jest.spyOn(tableServiceMock, 'getEntity').mockResolvedValue(receivedCheckEntity)
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [],
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
      partitionKey: uuid.v4(),
      rowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }
    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })
    jest.spyOn(compressionServiceMock, 'decompress').mockImplementation(() => {
      return JSON.stringify(getValidatedCheck())
    })
    jest.spyOn(tableServiceMock, 'getEntity').mockResolvedValue(receivedCheckEntity)
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [],
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
      partitionKey: uuid.v4(),
      rowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }
    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })
    jest.spyOn(tableServiceMock, 'getEntity').mockResolvedValue(receivedCheckEntity)
    const validCheck = getValidatedCheck()
    jest.spyOn(compressionServiceMock, 'decompress').mockImplementation(() => {
      return JSON.stringify(validCheck)
    })
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, validateReceivedCheckQueueMessage, loggerMock)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBeUndefined()
    expect(actualEntity.answers).toStrictEqual(JSON.stringify(validCheck.answers))
  })

  test('check marking message is created and added to output binding array', async () => {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      partitionKey: uuid.v4(),
      rowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1
    }
    jest.spyOn(compressionServiceMock, 'decompress').mockImplementation(() => {
      return JSON.stringify(getValidatedCheck())
    })
    jest.spyOn(tableServiceMock, 'getEntity').mockResolvedValue(receivedCheckEntity)
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [],
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
