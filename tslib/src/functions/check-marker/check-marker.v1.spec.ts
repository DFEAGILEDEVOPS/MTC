import * as Subject from './check-marker.v1'
import uuid = require('uuid')
import moment = require('moment')
import { ValidatedCheck } from '../../schemas'
import { IAsyncTableService } from '../../azure/async-table-service'
import { ICheckFormService } from './check-form.service'
import * as R from 'ramda'
import { ILogger } from '../../common/ILogger'
import checkSchema from '../../schemas/complete-check.v1.json'
import { ICheckMarkerFunctionBindings } from './Models'

const TableServiceMock = jest.fn<IAsyncTableService, any>(() => ({
  replaceEntityAsync: jest.fn(),
  queryEntitiesAsync: jest.fn(),
  deleteEntityAsync: jest.fn(),
  insertEntityAsync: jest.fn()
}))

const SqlServiceMock = jest.fn<ICheckFormService, any>(() => ({
  getCheckFormDataByCheckCode: jest.fn(),
  init: jest.fn()
}))

const LoggerMock = jest.fn<ILogger, any>(() => ({
  error: jest.fn(),
  info: jest.fn(),
  verbose: jest.fn(),
  warn: jest.fn()
}))

let sut: Subject.CheckMarkerV1
let tableServiceMock: IAsyncTableService
let sqlServiceMock: ICheckFormService
let loggerMock: ILogger

describe('check-marker/v1', () => {

  beforeEach(() => {
    tableServiceMock = new TableServiceMock()
    sqlServiceMock = new SqlServiceMock()
    loggerMock = new LoggerMock()
    sut = new Subject.CheckMarkerV1(tableServiceMock, sqlServiceMock)
  })

  test('subject under test should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('error is thrown when receivedCheck reference is not found', async () => {
    try {
      const functionBindings: ICheckMarkerFunctionBindings = {
        receivedCheckTable: [],
        checkNotificationQueue: []
      }
      await sut.mark(functionBindings, loggerMock)
      fail('error should have been thrown due to empty receivedCheckData')
    } catch (error) {
      expect(error.message).toBe('received check reference is empty')
    }
  })

  test('error is recorded against entity when answers is empty', async () => {

    const validatedCheckEntity: ValidatedCheck = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: ''
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    tableServiceMock.replaceEntityAsync = jest.fn(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.markError).toBe('answers property not populated')
    expect(actualEntity.markedAt).toBeTruthy()
  })

  test('error is recorded against entity when answers is not an array', async () => {
    const validatedCheckEntity: ValidatedCheck = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify({ foo: 1 })
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    tableServiceMock.replaceEntityAsync = jest.fn(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.markError).toBe('answers data is not an array')
    expect(actualEntity.markedAt).toBeTruthy()
  })

  test('error is recorded against entity when checkForm cannot be found by checkCode', async () => {
    const validatedCheckEntity: ValidatedCheck = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(checkSchema.answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    tableServiceMock.replaceEntityAsync = jest.fn(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })

    sqlServiceMock.getCheckFormDataByCheckCode = jest.fn(async (checkCode: string) => {
      return
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.markError).toBe('associated checkForm could not be found by checkCode')
    expect(actualEntity.markedAt).toBeTruthy()
  })

  test('error is recorded against entity when checkForm data is not valid JSON', async () => {
    const validatedCheckEntity: ValidatedCheck = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(checkSchema.answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    tableServiceMock.replaceEntityAsync = jest.fn(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })

    sqlServiceMock.getCheckFormDataByCheckCode = jest.fn(async (checkCode: string) => {
      return 'not JSON'
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.markError).toBe('associated checkForm data is not valid JSON')
    expect(actualEntity.markedAt).toBeTruthy()
  })

  test('error is recorded against entity when checkForm lookup throws error', async () => {
    const validatedCheckEntity: ValidatedCheck = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(checkSchema.answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    tableServiceMock.replaceEntityAsync = jest.fn(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })

    const expectedErrorMessage = 'sql error'
    sqlServiceMock.getCheckFormDataByCheckCode = jest.fn(async (checkCode: string) => {
      throw new Error(expectedErrorMessage)
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.markError).toBe(`checkForm lookup failed:${expectedErrorMessage}`)
    expect(actualEntity.markedAt).toBeTruthy()
  })

  test('error is recorded against entity when checkForm data is not a populated array', async () => {
    const validatedCheckEntity: ValidatedCheck = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(checkSchema.answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    tableServiceMock.replaceEntityAsync = jest.fn(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })

    sqlServiceMock.getCheckFormDataByCheckCode = jest.fn(async (checkCode: string) => {
      return JSON.stringify([])
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.markError).toBe('check form data is either empty or not an array')
    expect(actualEntity.markedAt).toBeTruthy()

    sqlServiceMock.getCheckFormDataByCheckCode = jest.fn(async (checkCode: string) => {
      return JSON.stringify({ not: 'array' })
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(2)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.markError).toBe('check form data is either empty or not an array')
    expect(actualEntity.markedAt).toBeTruthy()
  })

  test('marking updates entity with mark, maxMarks and timestamp: both answers correct', async () => {
    const answers = [
      {
        factor1: 2,
        factor2: 5,
        answer: '10',
        sequenceNumber: 1,
        question: '2x5',
        clientTimestamp: '2018-09-24T12:00:00.811Z'
      },
      {
        factor1: 11,
        factor2: 2,
        answer: '22',
        sequenceNumber: 2,
        question: '11x2',
        clientTimestamp: '2018-09-24T12:00:03.963Z'
      }
    ]
    const validatedCheckEntity: ValidatedCheck = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    tableServiceMock.replaceEntityAsync = jest.fn(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })

    sqlServiceMock.getCheckFormDataByCheckCode = jest.fn(async (checkCode: string) => {
      return JSON.stringify([
        {
          f1: 2,
          f2: 5
        },
        {
          f1: 11,
          f2: 2
        }])
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.mark).toBe(2)
    expect(actualEntity.maxMarks).toBe(2)
    expect(actualEntity.markError).toBeUndefined()
    expect(actualEntity.markedAt).toBeTruthy()
  })

  test('marking updates entity with mark, maxMarks and timestamp: one answer wrong', async () => {
    const answers = [
      {
        factor1: 2,
        factor2: 5,
        answer: '10',
        sequenceNumber: 1,
        question: '2x5',
        clientTimestamp: '2018-09-24T12:00:00.811Z'
      },
      {
        factor1: 11,
        factor2: 2,
        answer: '21',
        sequenceNumber: 2,
        question: '11x2',
        clientTimestamp: '2018-09-24T12:00:03.963Z'
      }
    ]
    const validatedCheckEntity: ValidatedCheck = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    tableServiceMock.replaceEntityAsync = jest.fn(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })

    sqlServiceMock.getCheckFormDataByCheckCode = jest.fn(async (checkCode: string) => {
      return JSON.stringify([
        {
          f1: 2,
          f2: 5
        },
        {
          f1: 11,
          f2: 2
        }])
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.mark).toBe(1)
    expect(actualEntity.maxMarks).toBe(2)
    expect(actualEntity.markError).toBeUndefined()
    expect(actualEntity.markedAt).toBeTruthy()
  })

  test('marking updates entity with mark, maxMarks and timestamp: both answers wrong', async () => {
    const answers = [
      {
        factor1: 2,
        factor2: 5,
        answer: '11',
        sequenceNumber: 1,
        question: '2x5',
        clientTimestamp: '2018-09-24T12:00:00.811Z'
      },
      {
        factor1: 11,
        factor2: 2,
        answer: '21',
        sequenceNumber: 2,
        question: '11x2',
        clientTimestamp: '2018-09-24T12:00:03.963Z'
      }
    ]
    const validatedCheckEntity: ValidatedCheck = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    tableServiceMock.replaceEntityAsync = jest.fn(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })

    sqlServiceMock.getCheckFormDataByCheckCode = jest.fn(async (checkCode: string) => {
      return JSON.stringify([
        {
          f1: 2,
          f2: 5
        },
        {
          f1: 11,
          f2: 2
        }])
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.mark).toBe(0)
    expect(actualEntity.maxMarks).toBe(2)
    expect(actualEntity.markError).toBeUndefined()
    expect(actualEntity.markedAt).toBeTruthy()
  })

  test('check notification is dispatched when marking successful', async () => {
    const answers = [
      {
        factor1: 2,
        factor2: 5,
        answer: '10',
        sequenceNumber: 1,
        question: '2x5',
        clientTimestamp: '2018-09-24T12:00:00.811Z'
      }
    ]
    const validatedCheckEntity: ValidatedCheck = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: []
    }

    sqlServiceMock.getCheckFormDataByCheckCode = jest.fn(async (checkCode: string) => {
      return JSON.stringify([
        {
          f1: 2,
          f2: 5
        }])
    })

    await sut.mark(functionBindings, loggerMock)
    expect(functionBindings.checkNotificationQueue.length).toBe(1)
    const notificationQueueMessage = R.head(functionBindings.checkNotificationQueue)
    expect(notificationQueueMessage.checkCode).toBeDefined()
    expect(notificationQueueMessage.type).toBe('marked')
  })

  test('check notification is dispatched when marking unsuccessful', async () => {
    const checkCode = uuid.v4()
    const validatedCheckEntity: ValidatedCheck = {
      PartitionKey: uuid.v4(),
      RowKey: checkCode,
      archive: 'foo',
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify({ foo: 1 })
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: []
    }

    await sut.mark(functionBindings, loggerMock)
    expect(functionBindings.checkNotificationQueue.length).toBe(1)
    const notificationQueueMessage = R.head(functionBindings.checkNotificationQueue)
    expect(notificationQueueMessage.checkCode).toBe(checkCode)
    expect(notificationQueueMessage.type).toBe('unmarkable')
  })
})
