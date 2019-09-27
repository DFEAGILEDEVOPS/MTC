import * as Subject from '../../check-marker/check-marker.v1'
import uuid = require('uuid')
import moment = require('moment')
import { ValidatedCheck } from '../../typings/message-schemas'
import { IAsyncTableService } from '../../lib/storage-helper'
import checkSchema from '../../messages/complete-check.v1.json'
import { ICheckFormService } from '../../lib/check-form.service'
import { S } from 'ts-toolbelt'

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

let sut: Subject.CheckMarkerV1
let tableServiceMock: IAsyncTableService
let sqlServiceMock: ICheckFormService

describe('check-marker/v1', () => {

  beforeEach(() => {
    tableServiceMock = new TableServiceMock()
    sqlServiceMock = new SqlServiceMock()
    sut = new Subject.CheckMarkerV1(tableServiceMock, sqlServiceMock)
  })

  test('subject under test should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('error is thrown when receivedCheck reference is not found', async () => {
    try {
      const functionBindings: Subject.ICheckMarkerFunctionBindings = {
        receivedCheckTable: [],
        checkNotificationQueue: []
      }
      await sut.mark(functionBindings)
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

    const functionBindings: Subject.ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    tableServiceMock.replaceEntityAsync = jest.fn(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })

    await sut.mark(functionBindings)
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

    const functionBindings: Subject.ICheckMarkerFunctionBindings = {
      receivedCheckTable: [validatedCheckEntity],
      checkNotificationQueue: []
    }

    let actualTableName: string | undefined
    let actualEntity: any
    tableServiceMock.replaceEntityAsync = jest.fn(async (table: string, entity: any) => {
      actualTableName = table
      actualEntity = entity
    })

    await sut.mark(functionBindings)
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

    const functionBindings: Subject.ICheckMarkerFunctionBindings = {
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

    await sut.mark(functionBindings)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(1)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.markError).toBe('associated checkForm could not be found by checkCode')
    expect(actualEntity.markedAt).toBeTruthy()

    sqlServiceMock.getCheckFormDataByCheckCode = jest.fn(async (checkCode: string) => {
      return []
    })

    await sut.mark(functionBindings)
    expect(tableServiceMock.replaceEntityAsync).toHaveBeenCalledTimes(2)
    expect(actualTableName).toBe('receivedCheck')
    expect(actualEntity.markError).toBe('associated checkForm could not be found by checkCode')
    expect(actualEntity.markedAt).toBeTruthy()
  })

})
