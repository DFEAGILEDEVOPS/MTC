import { CheckValidator, type ICheckValidatorFunctionBindings } from './check-validator'
import {
  type ReceivedCheckTableEntity,
  type MarkCheckMessageV1,
  type ValidateCheckMessageV1,
  type ReceivedCheckFunctionBindingEntity
} from '../../schemas/models'
import { type ILogger } from '../../common/logger'
import { type ICompressionService } from '../../common/compression-service'
import * as uuid from 'uuid'
import moment from 'moment'
import { CheckNotificationType } from '../../schemas/check-notification-message'
import { type ITableService } from '../../azure/table-service'
import { type TableEntity } from '@azure/data-tables'
import { type ICheckFormService } from '../../services/check-form.service'
import { type IValidatorProvider, ValidatorProvider } from './validators/validator.provider'
import * as mockSubmittedCheckV3 from '../../schemas/check-schemas/mock-valid-submitted-check.2023.json'
import * as R from 'ramda'
import { SubmittedCheckVersion } from '../../schemas/SubmittedCheckVersion'

let sut: CheckValidator
let loggerMock: ILogger
let tableServiceMock: ITableService
let compressionServiceMock: ICompressionService
let checkFormServiceMock: ICheckFormService
let validatorProvider: IValidatorProvider
let mockV3SubmittedCheck: any

describe('check-validator', () => {
  beforeEach(() => {
    mockV3SubmittedCheck = R.clone(mockSubmittedCheckV3)
    tableServiceMock = {
      createEntity: jest.fn(),
      getEntity: jest.fn(),
      mergeUpdateEntity: jest.fn(),
      replaceEntity: jest.fn()
    }
    compressionServiceMock = {
      compressToUTF16: jest.fn(),
      decompressFromUTF16: jest.fn(),
      compressToBase64: jest.fn(),
      decompressFromBase64: jest.fn()
    }
    checkFormServiceMock = {
      getCheckFormForCheckCode: jest.fn(),
      getCheckFormDataByCheckCode: jest.fn(),
      getLiveFormQuestionCount: jest.fn()
    }
    validatorProvider = new ValidatorProvider(checkFormServiceMock)
    sut = new CheckValidator(tableServiceMock, compressionServiceMock, validatorProvider)
    loggerMock = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      trace: jest.fn()
    }
    const checkFormQuestionsFromAnswers = mockV3SubmittedCheck.answers.map((answer: any) => {
      return {
        f1: answer.factor1,
        f2: answer.factor2
      }
    })
    jest.spyOn(checkFormServiceMock, 'getCheckFormForCheckCode').mockResolvedValue(checkFormQuestionsFromAnswers)
    jest.spyOn(checkFormServiceMock, 'getLiveFormQuestionCount').mockReturnValue(checkFormQuestionsFromAnswers.length)
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
      const message = {
        schoolUUID: 'uuid',
        checkCode: 'code',
        version: 1
      }
      await sut.validate(functionBindings, message, loggerMock)
      fail('error should have been thrown due to empty receivedCheckData')
    } catch (error: any) {
      expect(error.message).toBe('check-validator: received check reference is empty')
    }
  })

  test('unsupported check version should be rejected', async () => {
    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: TableEntity<object>) => {
      actualTableName = table
      actualEntity = entity
    })
    const unsupportedCheckVersion = 1
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      partitionKey: uuid.v4(),
      rowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: unsupportedCheckVersion
    }
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    const message = {
      schoolUUID: 'uuid',
      checkCode: 'code',
      version: 123
    }
    await sut.validate(functionBindings, message, loggerMock)
    expect(tableServiceMock.mergeUpdateEntity).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBe(`check-validator: unsupported check version:'${unsupportedCheckVersion}'`)
    expect(actualEntity.isValid).toBe(false)
  })

  test('validation error is recorded on receivedCheck entity when archive property is missing', async () => {
    let actualTableName: string | undefined
    let actualEntity: any
    const message = {
      schoolUUID: 'uuid',
      checkCode: 'code',
      version: 1
    }
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: TableEntity<object>) => {
      actualTableName = table
      actualEntity = entity
    })
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      partitionKey: uuid.v4(),
      rowKey: uuid.v4(),
      archive: undefined,
      checkReceivedAt: moment().toDate(),
      checkVersion: SubmittedCheckVersion.V2
    }
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, message, loggerMock)
    expect(tableServiceMock.mergeUpdateEntity).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBe('check-validator: message is missing [archive] property')
    expect(actualEntity.isValid).toBe(false)
  })

  test('v2 archive is decompressesed from UTF-16', async () => {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      partitionKey: uuid.v4(),
      rowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: SubmittedCheckVersion.V2
    }
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    const message = {
      schoolUUID: 'uuid',
      checkCode: 'code',
      version: 1
    }
    await sut.validate(functionBindings, message, loggerMock)
    expect(compressionServiceMock.decompressFromUTF16).toHaveBeenCalledWith('foo')
  })

  test('v3 archive is decompressesed from base64', async () => {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      partitionKey: uuid.v4(),
      rowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: SubmittedCheckVersion.V3
    }
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    const message = {
      schoolUUID: 'uuid',
      checkCode: 'code',
      version: 1
    }
    await sut.validate(functionBindings, message, loggerMock)
    expect(compressionServiceMock.decompressFromBase64).toHaveBeenCalledWith('foo')
  })

  test('submitted check with missing properties are recorded as validation errors against the entity', async () => {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      partitionKey: uuid.v4(),
      rowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: SubmittedCheckVersion.V2
    }
    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })
    jest.spyOn(compressionServiceMock, 'decompressFromUTF16').mockImplementation(() => {
      return JSON.stringify({
        foo: 'bar'
      })
    })
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    const message = {
      schoolUUID: 'uuid',
      checkCode: 'code',
      version: 1
    }
    await sut.validate(functionBindings, message, loggerMock)
    expect(tableServiceMock.mergeUpdateEntity).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBeDefined()
    expect(actualEntity.isValid).toBe(false)
  })

  test('validation errors are reported to check notification queue', async () => {
    const message = {
      schoolUUID: 'uuid-123',
      checkCode: 'code-456',
      version: 1
    }
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      partitionKey: message.schoolUUID,
      rowKey: message.checkCode,
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: SubmittedCheckVersion.V2
    }

    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation()
    jest.spyOn(compressionServiceMock, 'decompressFromUTF16').mockImplementation(() => {
      return JSON.stringify({
        foo: 'bar'
      })
    })
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, message, loggerMock)
    expect(functionBindings.checkNotificationQueue).toBeDefined()
    expect(functionBindings.checkNotificationQueue).toHaveLength(1)
    const validationFailureMessage = functionBindings.checkNotificationQueue[0]
    expect(validationFailureMessage.checkCode).toStrictEqual(message.checkCode)
    expect(validationFailureMessage.notificationType).toBe(CheckNotificationType.checkInvalid)
    expect(validationFailureMessage.version).toBe(1)
  })

  test('validation error is recorded on receivedCheck entity when archive is missing', async () => {
    const message = {
      schoolUUID: 'uuid',
      checkCode: 'code',
      version: 1
    }
    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: TableEntity<object>) => {
      actualTableName = table
      actualEntity = entity
    })
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      partitionKey: uuid.v4(),
      rowKey: uuid.v4(),
      archive: undefined,
      checkReceivedAt: moment().toDate(),
      checkVersion: SubmittedCheckVersion.V3
    }
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    await sut.validate(functionBindings, message, loggerMock)
    expect(tableServiceMock.mergeUpdateEntity).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBe('check-validator: message is missing [archive] property')
    expect(actualEntity.isValid).toBe(false)
  })

  test('submitted check with no validation errors is marked as valid', async () => {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      partitionKey: uuid.v4(),
      rowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: SubmittedCheckVersion.V2
    }
    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })
    jest.spyOn(compressionServiceMock, 'decompressFromUTF16').mockImplementation(() => {
      return JSON.stringify(mockV3SubmittedCheck)
    })
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    const message = {
      schoolUUID: 'uuid',
      checkCode: 'code',
      version: 1
    }
    await sut.validate(functionBindings, message, loggerMock)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBeUndefined()
    expect(actualEntity.isValid).toBe(true)
  })

  test('check marking message is created and added to output binding array', async () => {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      partitionKey: uuid.v4(),
      rowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: SubmittedCheckVersion.V2
    }
    jest.spyOn(compressionServiceMock, 'decompressFromUTF16').mockImplementation(() => {
      return JSON.stringify(mockV3SubmittedCheck)
    })
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    const message = {
      schoolUUID: 'uuid',
      checkCode: 'code',
      version: 1
    }
    await sut.validate(functionBindings, message, loggerMock)
    expect(functionBindings.checkMarkingQueue).toHaveLength(1)
    const checkMarkingMessage: MarkCheckMessageV1 = functionBindings.checkMarkingQueue[0]
    expect(checkMarkingMessage.checkCode).toStrictEqual(message.checkCode)
    expect(checkMarkingMessage.schoolUUID).toStrictEqual(message.schoolUUID)
    expect(checkMarkingMessage.version).toBe(1)
  })

  test('should validate a valid v3 check', async () => {
    let capturedIsValidFlag = false
    let capturedAnswers = ''
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: TableEntity<any>) => {
      capturedIsValidFlag = entity.isValid
      capturedAnswers = entity.answers
    })

    const stringifiedPayload = JSON.stringify(mockV3SubmittedCheck)
    jest.spyOn(compressionServiceMock, 'decompressFromBase64').mockImplementation(() => {
      return stringifiedPayload
    })

    const receivedCheckEntry: ReceivedCheckFunctionBindingEntity = {
      checkReceivedAt: new Date(),
      checkVersion: 3,
      PartitionKey: mockV3SubmittedCheck.schoolUUID,
      RowKey: mockV3SubmittedCheck.checkCode,
      archive: stringifiedPayload,
      answers: undefined,
      isValid: undefined,
      mark: undefined,
      markedAt: undefined,
      markError: undefined,
      maxMarks: undefined,
      processingError: undefined
    }
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntry],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    const message: ValidateCheckMessageV1 = {
      checkCode: mockV3SubmittedCheck.checkCode,
      schoolUUID: mockV3SubmittedCheck.schoolUUID,
      version: 1
    }
    await sut.validate(functionBindings, message, loggerMock)
    expect(tableServiceMock.mergeUpdateEntity).toHaveBeenCalledTimes(1)
    expect(capturedIsValidFlag).toBe(true)
    expect(capturedAnswers).toStrictEqual(JSON.stringify(mockV3SubmittedCheck.answers))
  })

  test('submitted check with no validation errors has answers added to receivedCheck entity', async () => {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      partitionKey: uuid.v4(),
      rowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: SubmittedCheckVersion.V2
    }
    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })
    jest.spyOn(compressionServiceMock, 'decompressFromUTF16').mockImplementation(() => {
      return JSON.stringify(mockV3SubmittedCheck)
    })
    const functionBindings: ICheckValidatorFunctionBindings = {
      receivedCheckTable: [receivedCheckEntity],
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    const message = {
      schoolUUID: 'uuid',
      checkCode: 'code',
      version: 1
    }
    await sut.validate(functionBindings, message, loggerMock)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBeUndefined()
    expect(actualEntity.answers).toStrictEqual(JSON.stringify(mockV3SubmittedCheck.answers))
  })
})
