import { PupilFeedbackService, IPupilFeedbackFunctionBinding, IPupilFeedbackMessage } from './feedback.service'
import v4 from 'uuid'

let sut: PupilFeedbackService

const message: IPupilFeedbackMessage = {
  version: 2,
  PartitionKey: v4(),
  RowKey: v4(),
  checkCode: v4(),
  comments: 'comments',
  inputType: 'inputType',
  satisfactionRating: 'rating'
}

const bindings: IPupilFeedbackFunctionBinding = {
  feedbackTable: []
}

describe('pupil feedback service', () => {
  beforeEach(() => {
    sut = new PupilFeedbackService()
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
})
