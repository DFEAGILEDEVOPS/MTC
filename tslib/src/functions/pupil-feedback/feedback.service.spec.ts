import { PupilFeedbackService, type IPupilFeedbackFunctionBinding, type IPupilFeedbackMessage, type IPupilFeedbackTableEntity } from './feedback.service'
import { v4 as uuidv4 } from 'uuid'

let sut: PupilFeedbackService
let message: IPupilFeedbackMessage
let bindings: IPupilFeedbackFunctionBinding

describe('pupil feedback service', () => {
  beforeEach(() => {
    sut = new PupilFeedbackService()
    message = {
      version: 2,
      checkCode: uuidv4(),
      comments: 'comments',
      inputType: 'inputType',
      satisfactionRating: 'rating'
    }
    bindings = {
      feedbackTable: []
    }
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('unsupported message version throws error', () => {
    try {
      message.version = 1
      sut.process(bindings, message)
      fail('error should have been thrown')
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      expect(errorMessage).toBe(`version:${message.version} unsupported`)
    }
  })

  test('feedback message should be added to feedback table binding', () => {
    sut.process(bindings, message)
    expect(bindings.feedbackTable).toHaveLength(1)
  })

  test('all expected message properties should be inserted into feedback table', () => {
    sut.process(bindings, message)
    const entity = bindings.feedbackTable[0] as IPupilFeedbackTableEntity
    expect(entity.PartitionKey).toStrictEqual(message.checkCode)
    expect(entity.RowKey).toBeDefined()
    expect(entity.RowKey).toHaveLength(uuidv4().length)
    expect(entity.checkCode).toStrictEqual(message.checkCode)
    expect(entity.inputType).toStrictEqual(message.inputType)
    expect(entity.satisfactionRating).toStrictEqual(message.satisfactionRating)
    expect(entity.comments).toStrictEqual(message.comments)
  })
})
