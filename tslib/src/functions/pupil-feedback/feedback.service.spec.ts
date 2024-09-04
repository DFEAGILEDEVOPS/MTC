import { PupilFeedbackService, type IPupilFeedbackMessage, type IPupilFeedbackTableEntity } from './feedback.service'
import { v4 as uuidv4 } from 'uuid'

let sut: PupilFeedbackService
let message: IPupilFeedbackMessage

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
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('unsupported message version throws error', () => {
    try {
      message.version = 1
      sut.process(message)
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
    const output = sut.process(message)
    expect(output.feedbackTable).toHaveLength(1)
  })

  test('all expected message properties should be inserted into feedback table', () => {
    const output = sut.process(message)
    const entity = output.feedbackTable[0] as IPupilFeedbackTableEntity
    expect(entity.PartitionKey).toStrictEqual(message.checkCode)
    expect(entity.RowKey).toBeDefined()
    expect(entity.RowKey).toHaveLength(uuidv4().length)
    expect(entity.checkCode).toStrictEqual(message.checkCode)
    expect(entity.inputType).toStrictEqual(message.inputType)
    expect(entity.satisfactionRating).toStrictEqual(message.satisfactionRating)
    expect(entity.comments).toStrictEqual(message.comments)
  })
})
