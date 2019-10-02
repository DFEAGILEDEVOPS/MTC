import * as subject from '../../check-allocator/check-allocator.v1'

let sut: subject.CheckAllocatorV1

describe('check-allocator/v1', () => {
  beforeEach(() => {
    sut = new subject.CheckAllocatorV1()
  })
  test('should be defined', () => {
    expect(sut).toBeDefined()
  })
})
