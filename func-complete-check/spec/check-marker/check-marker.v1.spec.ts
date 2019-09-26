import { CheckMarkerV1 } from '../../check-marker/check-marker.v1'

let sut: CheckMarkerV1

describe('check-marker/v1', () => {

  beforeEach(() => {
    sut = new CheckMarkerV1()
  })

  test('subject under test should be defined', () => {
    expect(sut).toBeDefined()
  })
})
