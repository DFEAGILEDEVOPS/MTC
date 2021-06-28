import { SubmittedCheckBuilderService } from './submitted-check-builder-service'

let sut: SubmittedCheckBuilderService

describe('submitted-check-builder-service', () => {
  beforeEach(() => {
    sut = new SubmittedCheckBuilderService()
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(SubmittedCheckBuilderService)
  })

  test('', () => {
  })
})
