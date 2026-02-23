import { PupilFeedbackService, type IPupilFeedbackMessage } from './feedback.service'
import { v4 as uuidv4 } from 'uuid'
import type { ISqlService, ISqlParameter } from '../../sql/sql.service'

let sut: PupilFeedbackService
let message: IPupilFeedbackMessage
let sqlServiceMock: ISqlService

const SqlServiceMock = jest.fn<ISqlService, []>(() => ({
  modify: jest.fn(),
  modifyWithTransaction: jest.fn(),
  query: jest.fn()
}))

describe('pupil feedback service', () => {
  beforeEach(() => {
    sqlServiceMock = new SqlServiceMock()
    sut = new PupilFeedbackService(sqlServiceMock)
    message = {
      version: 3,
      checkCode: uuidv4(),
      feedback: 'rating'
    }
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('unsupported message version throws error', async () => {
    try {
      message.version = 2
      await sut.process(message)
      fail('error should have been thrown')
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      expect(errorMessage).toBe(`version:${message.version} unsupported`)
    }
  })

  test('validation should fail if message does not contain checkCode', async () => {
    message.checkCode = ''
    await expect(sut.process(message)).rejects.toThrow('checkCode is required')

    message.checkCode = undefined
    await expect(sut.process(message)).rejects.toThrow('checkCode is required')
  })

  test('validation should fail if feedback is not provided', async () => {
    message.feedback = ''
    await expect(sut.process(message)).rejects.toThrow('feedback is required')

    message.feedback = undefined
    await expect(sut.process(message)).rejects.toThrow('feedback is required')
  })

  test('sql service is called with correct parameters', async () => {
    await sut.process(message)
    expect(sqlServiceMock.modify).toHaveBeenCalledWith(expect.any(String), expect.any(Array<ISqlParameter>))
  })
})
