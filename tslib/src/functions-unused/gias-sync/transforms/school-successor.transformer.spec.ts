import { SuccessorTransformer } from './school-transformer'

let sut: SuccessorTransformer

describe('successor transformer', () => {
  beforeEach(() => {
    sut = new SuccessorTransformer()
  })
  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })
})
