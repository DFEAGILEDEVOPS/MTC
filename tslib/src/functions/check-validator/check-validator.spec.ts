import { CheckValidator, type ICheckValidatorFunctionBindings } from './check-validator'
import { type ReceivedCheckTableEntity, type ValidateCheckMessageV1, type MarkCheckMessageV1 } from '../../schemas/models'
import { type ILogger } from '../../common/logger'
import { type ICompressionService } from '../../common/compression-service'
import * as uuid from 'uuid'
import moment from 'moment'
import { CheckNotificationType } from '../../schemas/check-notification-message'
import { getValidatedCheck } from '../../schemas/check-schemas/validated-check'
import { type ITableService } from '../../azure/table-service'
import { type TableEntity } from '@azure/data-tables'
import { type ICheckFormService } from '../../services/check-form.service'
import { type IValidatorProvider, ValidatorProvider } from './validators/validator.provider'

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

const CheckFormServiceMock = jest.fn<ICheckFormService, any>(() => ({
  getCheckFormForCheckCode: jest.fn(),
  getCheckFormDataByCheckCode: jest.fn()
}))

let sut: CheckValidator
let loggerMock: ILogger
let tableServiceMock: ITableService
let compressionServiceMock: ICompressionService
let checkFormServiceMock: ICheckFormService
let validatorProvider: IValidatorProvider

describe('check-validator', () => {
  beforeEach(() => {
    tableServiceMock = new TableServiceMock()
    compressionServiceMock = new CompressionServiceMock()
    checkFormServiceMock = new CheckFormServiceMock()
    validatorProvider = new ValidatorProvider(checkFormServiceMock)
    sut = new CheckValidator(tableServiceMock, compressionServiceMock, validatorProvider)
    loggerMock = new LoggerMock()
    validateReceivedCheckQueueMessage = {
      schoolUUID: 'abc',
      checkCode: 'xyz',
      version: 1
    }
    jest.spyOn(checkFormServiceMock, 'getCheckFormForCheckCode').mockResolvedValue([
      { f1: 0, f2: 0 },
      { f1: 1, f2: 1 },
      { f1: 2, f2: 2 },
      { f1: 3, f2: 3 },
      { f1: 4, f2: 4 },
      { f1: 5, f2: 5 },
      { f1: 6, f2: 6 },
      { f1: 7, f2: 7 },
      { f1: 8, f2: 8 },
      { f1: 9, f2: 9 },
      { f1: 10, f2: 10 },
      { f1: 11, f2: 11 },
      { f1: 12, f2: 12 },
      { f1: 13, f2: 13 },
      { f1: 14, f2: 14 },
      { f1: 15, f2: 15 },
      { f1: 16, f2: 16 },
      { f1: 17, f2: 17 },
      { f1: 18, f2: 18 },
      { f1: 19, f2: 19 },
      { f1: 20, f2: 20 },
      { f1: 21, f2: 21 },
      { f1: 22, f2: 22 },
      { f1: 23, f2: 23 },
      { f1: 24, f2: 24 }
    ])
  })

  afterEach(() => {
    jest.restoreAllMocks()
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
      expect(error.message).toBe('check-validator: received check reference is empty')
    }
  })

  test('validation error is recorded on receivedCheck entity when archive property is missing', async () => {
    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: TableEntity<object>) => {
      actualTableName = table
      actualEntity = entity
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
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
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
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
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
    const functionBindings: ICheckValidatorFunctionBindings = {
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
    const functionBindings: ICheckValidatorFunctionBindings = {
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
    const validCheck = getValidatedCheck()
    jest.spyOn(compressionServiceMock, 'decompress').mockImplementation(() => {
      return JSON.stringify(validCheck)
    })
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
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
    const functionBindings: ICheckValidatorFunctionBindings = {
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
