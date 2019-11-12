import { CheckStartedService } from './check-started.service'

let sut: CheckStartedService

describe('check-started.service', () => {

  beforeEach(() => {
    sut = new CheckStartedService()
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })
})
