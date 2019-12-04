import { PupilFeedbackService } from './feedback.service'

let sut: PupilFeedbackService

describe('pupil feedback service', () => {
  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test.todo('object added to binding is expected format')
})
