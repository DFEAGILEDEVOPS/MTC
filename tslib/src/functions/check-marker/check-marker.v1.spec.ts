import uuid = require('uuid')
import moment = require('moment')
import * as R from 'ramda'

import * as Subject from './check-marker.v1'
import { type ICheckFormService } from '../../services/check-form.service'
import { type ILogger } from '../../common/logger'
import { type ICheckMarkerFunctionBindings } from './models'
import answersMock from './answers-mock.json'
import { CheckNotificationType, type ICheckNotificationMessage } from '../../schemas/check-notification-message'
import { type ReceivedCheckFunctionBindingEntity } from '../../schemas/models'
import { CompressionService } from '../../common/compression-service'
import { type ITableService } from '../../azure/table-service'

const compressionService = new CompressionService()

const TableServiceMock = jest.fn<ITableService, any>(() => ({
  createEntity: jest.fn(),
  getEntity: jest.fn(),
  mergeUpdateEntity: jest.fn(),
  replaceEntity: jest.fn()
}))

const SqlServiceMock = jest.fn<ICheckFormService, any>(() => ({
  getCheckFormDataByCheckCode: jest.fn(),
  getCheckFormForCheckCode: jest.fn(),
  getLiveFormQuestionCount: jest.fn(),
  init: jest.fn()
}))

const LoggerMock = jest.fn<ILogger, any>(() => ({
  error: jest.fn(),
  info: jest.fn(),
  trace: jest.fn(),
  warn: jest.fn()
}))

let sut: Subject.CheckMarkerV1
let tableServiceMock: ITableService
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
        checkNotificationQueue: [],
        checkResultTable: []
      }
      await sut.mark(functionBindings, loggerMock)
      fail('error should have been thrown due to empty receivedCheckData')
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      expect(errorMessage).toBe('received check reference is empty')
    }
  })

  test('error is recorded against entity when answers is empty', async () => {
    const validatedCheckEntity: ReceivedCheckFunctionBindingEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: compressionService.compressToUTF16(JSON.stringify({})),
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: ''
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: [],
      checkResultTable: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: any): Promise<void> => {
      actualTableName = table
      actualEntity = entity
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.mergeUpdateEntity).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBe('answers property not populated')
    expect(actualEntity.markedAt).toBeDefined()
  })

  test('error is recorded against entity when answers is not an array', async () => {
    const validatedCheckEntity: ReceivedCheckFunctionBindingEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: compressionService.compressToUTF16(JSON.stringify({})),
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify({ foo: 1 })
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: [],
      checkResultTable: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: any): Promise<void> => {
      actualTableName = table
      actualEntity = entity
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.mergeUpdateEntity).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBe('answers data is not an array')
    expect(actualEntity.markedAt).toBeDefined()
  })

  test('error is recorded against entity when checkForm cannot be found by checkCode', async () => {
    const validatedCheckEntity: ReceivedCheckFunctionBindingEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: compressionService.compressToUTF16(JSON.stringify({})),
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(answersMock.answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: [],
      checkResultTable: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: any): Promise<void> => {
      actualTableName = table
      actualEntity = entity
    })

    jest.spyOn(sqlServiceMock, 'getCheckFormDataByCheckCode')

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.mergeUpdateEntity).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBe('associated checkForm could not be found by checkCode')
    expect(actualEntity.markedAt).toBeDefined()
  })

  test('error is recorded against entity when checkForm data is not valid JSON', async () => {
    const validatedCheckEntity: ReceivedCheckFunctionBindingEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: compressionService.compressToUTF16(JSON.stringify({})),
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(answersMock.answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: [],
      checkResultTable: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: any): Promise<void> => {
      actualTableName = table
      actualEntity = entity
    })

    jest.spyOn(sqlServiceMock, 'getCheckFormDataByCheckCode').mockImplementation(async () => {
      return 'not JSON'
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.mergeUpdateEntity).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBe('associated checkForm data is not valid JSON')
    expect(actualEntity.markedAt).toBeDefined()
  })

  test('error is recorded against entity when checkForm lookup throws error', async () => {
    const validatedCheckEntity: ReceivedCheckFunctionBindingEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: compressionService.compressToUTF16(JSON.stringify({})),
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(answersMock.answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: [],
      checkResultTable: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: any): Promise<void> => {
      actualTableName = table
      actualEntity = entity
    })

    const expectedErrorMessage = 'sql error'
    jest.spyOn(sqlServiceMock, 'getCheckFormDataByCheckCode').mockImplementation(async () => {
      throw new Error(expectedErrorMessage)
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.mergeUpdateEntity).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBe(`checkForm lookup failed:${expectedErrorMessage}`)
    expect(actualEntity.markedAt).toBeDefined()
  })

  test('error is recorded against entity when checkForm data is not a populated array', async () => {
    const validatedCheckEntity: ReceivedCheckFunctionBindingEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: compressionService.compressToUTF16(JSON.stringify({})),
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(answersMock.answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: [],
      checkResultTable: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    jest.spyOn(tableServiceMock, 'mergeUpdateEntity').mockImplementation(async (table: string, entity: any): Promise<void> => {
      actualTableName = table
      actualEntity = entity
    })

    jest.spyOn(sqlServiceMock, 'getCheckFormDataByCheckCode').mockImplementation(async () => {
      return JSON.stringify([])
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.mergeUpdateEntity).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBe('check form data is either empty or not an array')
    expect(actualEntity.markedAt).toBeDefined()

    jest.spyOn(sqlServiceMock, 'getCheckFormDataByCheckCode').mockImplementation(async () => {
      return JSON.stringify({ not: 'array' })
    })

    await sut.mark(functionBindings, loggerMock)
    expect(tableServiceMock.mergeUpdateEntity).toHaveBeenCalledTimes(2)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.processingError).toBe('check form data is either empty or not an array')
    expect(actualEntity.markedAt).toBeDefined()
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
    const validatedCheckEntity: ReceivedCheckFunctionBindingEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: compressionService.compressToUTF16(JSON.stringify({})),
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: [],
      checkResultTable: []
    }

    jest.spyOn(sqlServiceMock, 'getCheckFormDataByCheckCode').mockImplementation(async () => {
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
    const persistMarkSpy = jest.spyOn<any, any>(sut, 'persistMark')

    await sut.mark(functionBindings, loggerMock)
    expect(persistMarkSpy).toHaveBeenCalledTimes(1)
    const checkResult: any = persistMarkSpy.mock.calls[0][0]
    expect(checkResult.mark).toBe(2)
    expect(checkResult.maxMarks).toBe(2)
    expect(checkResult.processingError).toBeUndefined()
    expect(checkResult.markedAt).toBeDefined()
    expect(checkResult.markedAnswers[0].isCorrect).toBe(true)
    expect(checkResult.markedAnswers[1].isCorrect).toBe(true)

    persistMarkSpy.mockRestore()
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
    const validatedCheckEntity: ReceivedCheckFunctionBindingEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: compressionService.compressToUTF16(JSON.stringify({})),
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: [],
      checkResultTable: []
    }

    jest.spyOn(sqlServiceMock, 'getCheckFormDataByCheckCode').mockImplementation(async () => {
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
    const persistMarkSpy = jest.spyOn<any, any>(sut, 'persistMark')

    await sut.mark(functionBindings, loggerMock)
    expect(persistMarkSpy).toHaveBeenCalledTimes(1)
    const checkResult: any = persistMarkSpy.mock.calls[0][0]
    expect(checkResult.mark).toBe(1)
    expect(checkResult.maxMarks).toBe(2)
    expect(checkResult.processingError).toBeUndefined()
    expect(checkResult.markedAt).toBeInstanceOf(Date)
    expect(checkResult.markedAnswers[0].isCorrect).toBe(true)
    expect(checkResult.markedAnswers[1].isCorrect).toBe(false)

    persistMarkSpy.mockRestore()
  })

  test('marking updates check result entity with mark, maxMarks and timestamp: both answers wrong', async () => {
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
    const validatedCheckEntity: ReceivedCheckFunctionBindingEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: compressionService.compressToUTF16(JSON.stringify({})),
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: [],
      checkResultTable: []
    }

    jest.spyOn(sqlServiceMock, 'getCheckFormDataByCheckCode').mockImplementation(async () => {
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
    const persistMarkSpy = jest.spyOn<any, any>(sut, 'persistMark')

    await sut.mark(functionBindings, loggerMock)
    expect(persistMarkSpy).toHaveBeenCalledTimes(1)
    const checkResult: any = persistMarkSpy.mock.calls[0][0]
    expect(checkResult.mark).toBe(0)
    expect(checkResult.maxMarks).toBe(2)
    expect(checkResult.markedAt).toBeInstanceOf(Date)
    expect(checkResult.markedAnswers[0].isCorrect).toBe(false)
    expect(checkResult.markedAnswers[1].isCorrect).toBe(false)

    const receivedCheckEntity = functionBindings.receivedCheckTable[0]
    expect(receivedCheckEntity.processingError).toBeUndefined()

    persistMarkSpy.mockRestore()
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
    const validatedCheckEntity: ReceivedCheckFunctionBindingEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: compressionService.compressToUTF16(JSON.stringify({})),
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: [],
      checkResultTable: []
    }

    jest.spyOn(sqlServiceMock, 'getCheckFormDataByCheckCode').mockImplementation(async () => {
      return JSON.stringify([
        {
          f1: 2,
          f2: 5
        }])
    })

    await sut.mark(functionBindings, loggerMock)
    expect(functionBindings.checkNotificationQueue).toHaveLength(1)
    const notificationQueueMessage: ICheckNotificationMessage = R.head(functionBindings.checkNotificationQueue)
    expect(notificationQueueMessage.checkCode).toBeDefined()
    expect(notificationQueueMessage.notificationType).toBe(CheckNotificationType.checkComplete)
  })

  test('check notification is dispatched when marking unsuccessful', async () => {
    const checkCode = uuid.v4()
    const validatedCheckEntity: ReceivedCheckFunctionBindingEntity = {
      PartitionKey: uuid.v4(),
      RowKey: checkCode,
      archive: compressionService.compressToUTF16(JSON.stringify({})),
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify({ foo: 1 })
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: [],
      checkResultTable: []
    }

    await sut.mark(functionBindings, loggerMock)
    expect(functionBindings.checkNotificationQueue).toHaveLength(1)
    const notificationQueueMessage: ICheckNotificationMessage = R.head(functionBindings.checkNotificationQueue)
    expect(notificationQueueMessage.checkCode).toBe(checkCode)
    expect(notificationQueueMessage.notificationType).toBe(CheckNotificationType.checkInvalid)
  })

  test('marking uses the first provided answer if there are duplicates', async () => {
    const answers = [
      {
        factor1: 2,
        factor2: 5,
        answer: '11',
        sequenceNumber: 1,
        question: '2x5',
        clientTimestamp: '2018-09-24T12:00:00.811Z' // 2nd answer (1st repeated - e.g. app error)
      },
      {
        factor1: 11,
        factor2: 2,
        answer: '22',
        sequenceNumber: 2,
        question: '11x2',
        clientTimestamp: '2018-09-24T12:00:03.963Z' // 3rd answer
      },
      {
        factor1: 2,
        factor2: 5,
        answer: '10',
        sequenceNumber: 1,
        question: '2x5',
        clientTimestamp: '2018-09-24T11:59:01.123Z' // 1st answer out of sequence
      }
    ]
    const validatedCheckEntity: ReceivedCheckFunctionBindingEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: compressionService.compressToUTF16(JSON.stringify({})),
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: [],
      checkResultTable: []
    }

    jest.spyOn(sqlServiceMock, 'getCheckFormDataByCheckCode').mockImplementation(async () => {
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
    const persistMarkSpy = jest.spyOn<any, any>(sut, 'persistMark')

    await sut.mark(functionBindings, loggerMock)
    expect(persistMarkSpy).toHaveBeenCalledTimes(1)
    const checkResult: any = persistMarkSpy.mock.calls[0][0]

    expect(checkResult.markedAnswers[0]).toStrictEqual({
      factor1: 2,
      factor2: 5,
      answer: '10',
      sequenceNumber: 1,
      question: '2x5',
      clientTimestamp: '2018-09-24T11:59:01.123Z',
      isCorrect: true
    })

    expect(checkResult.mark).toBe(2)
    persistMarkSpy.mockRestore()
  })

  test('marking uses the first provided answer if there are duplicates, with the same timestamp', async () => {
    const answers = [
      {
        factor1: 2,
        factor2: 5,
        answer: '10',
        sequenceNumber: 1,
        question: '2x5',
        clientTimestamp: '2018-09-24T12:00:00.811Z', // Duplicate answer to Q1 - e.g. app error
        monotonicTime: {
          milliseconds: 0,
          legacyDate: '2018-09-24T12:00:00.811Z',
          sequenceNumber: 2
        }
      },
      {
        factor1: 11,
        factor2: 2,
        answer: '22',
        sequenceNumber: 2,
        question: '11x2',
        clientTimestamp: '2018-09-24T12:00:03.963Z', // 3rd answer
        monotonicTime: {
          milliseconds: 0,
          legacyDate: '2018-09-24T12:00:03.963Z',
          sequenceNumber: 3
        }
      },
      {
        factor1: 2,
        factor2: 5,
        answer: '99',
        sequenceNumber: 1,
        question: '2x5',
        clientTimestamp: '2018-09-24T12:00:00.811Z', // 1st answer out of sequence
        monotonicTime: {
          milliseconds: 0,
          legacyDate: '2018-09-24T12:00:00.811Z',
          sequenceNumber: 1
        }
      }
    ]
    const validatedCheckEntity: ReceivedCheckFunctionBindingEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: compressionService.compressToUTF16(JSON.stringify({})),
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: [],
      checkResultTable: []
    }

    jest.spyOn(sqlServiceMock, 'getCheckFormDataByCheckCode').mockImplementation(async () => {
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
    const persistMarkSpy = jest.spyOn<any, any>(sut, 'persistMark')

    await sut.mark(functionBindings, loggerMock)
    expect(persistMarkSpy).toHaveBeenCalledTimes(1)
    const checkResult: any = persistMarkSpy.mock.calls[0][0]

    expect(checkResult.markedAnswers[0]).toStrictEqual({
      factor1: 2,
      factor2: 5,
      answer: '99',
      sequenceNumber: 1,
      question: '2x5',
      clientTimestamp: '2018-09-24T12:00:00.811Z',
      isCorrect: false,
      monotonicTime: {
        milliseconds: 0,
        legacyDate: '2018-09-24T12:00:00.811Z',
        sequenceNumber: 1
      }
    })

    expect(checkResult.mark).toBe(1)
    persistMarkSpy.mockRestore()
  })

  test('marking is correct even if an answer is missing from the input', async () => {
    const answers = [
      {
        factor1: 5,
        factor2: 5,
        answer: '25',
        sequenceNumber: 2,
        question: '2x5',
        clientTimestamp: '2018-09-24T12:00:00.811Z'
      }
    ]
    const validatedCheckEntity: ReceivedCheckFunctionBindingEntity = {
      PartitionKey: uuid.v4(),
      RowKey: uuid.v4(),
      archive: compressionService.compressToUTF16(JSON.stringify({})),
      checkReceivedAt: moment().toDate(),
      checkVersion: 1,
      isValid: true,
      validatedAt: moment().toDate(),
      answers: JSON.stringify(answers)
    }

    const functionBindings: ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: [],
      checkResultTable: []
    }

    jest.spyOn(sqlServiceMock, 'getCheckFormDataByCheckCode').mockImplementation(async () => {
      return JSON.stringify([
        {
          f1: 2,
          f2: 5
        },
        {
          f1: 5,
          f2: 5
        }])
    })
    const persistMarkSpy = jest.spyOn<any, any>(sut, 'persistMark')

    await sut.mark(functionBindings, loggerMock)
    expect(persistMarkSpy).toHaveBeenCalledTimes(1)
    const checkResult: any = persistMarkSpy.mock.calls[0][0]

    expect(checkResult.markedAnswers[0]).toStrictEqual({
      factor1: 2,
      factor2: 5,
      answer: '',
      sequenceNumber: 1,
      question: '2x5',
      clientTimestamp: '',
      isCorrect: false
    })

    expect(checkResult.markedAnswers[1]).toStrictEqual({
      factor1: 5,
      factor2: 5,
      answer: '25',
      sequenceNumber: 2,
      question: '5x5',
      clientTimestamp: '2018-09-24T12:00:00.811Z',
      isCorrect: true
    })

    expect(checkResult.mark).toBe(1)
    expect(checkResult.maxMarks).toBe(2)
    persistMarkSpy.mockRestore()
  })
})
