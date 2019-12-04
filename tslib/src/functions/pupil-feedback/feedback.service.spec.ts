import { PupilFeedbackService, IPupilFeedbackFunctionBinding, IPupilFeedbackMessage, IPupilFeedbackTableEntity } from './feedback.service'
import v4 from 'uuid'

let sut: PupilFeedbackService
let message: IPupilFeedbackMessage
let bindings: IPupilFeedbackFunctionBinding

describe('pupil feedback service', () => {
  beforeEach(() => {
    sut = new PupilFeedbackService()
    message = {
      version: 2,
      checkCode: v4(),
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
      expect(error.message).toBe(`version:${message.version} unsupported`)
    }
  })

  test('feedback message should be added to feedback table binding', () => {
    sut.process(bindings, message)
    expect(bindings.feedbackTable.length).toBe(1)
  })

  test('all expected message properties should be inserted into feedback table', () => {
    sut.process(bindings, message)
    const entity = bindings.feedbackTable[0] as IPupilFeedbackTableEntity
    expect(entity.PartitionKey).toEqual(message.checkCode)
    expect(entity.RowKey).toBeDefined()
    expect(entity.RowKey.length).toBe(v4().length)
    expect(entity.checkCode).toEqual(message.checkCode)
    expect(entity.inputType).toEqual(message.inputType)
    expect(entity.satisfactionRating).toEqual(message.satisfactionRating)
    expect(entity.comments).toEqual(message.comments)
  })
})
