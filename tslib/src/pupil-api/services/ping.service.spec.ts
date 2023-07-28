import { PingService } from './ping.service'

let sut: PingService

describe('ping.service', () => {
  beforeEach(() => {
    sut = new PingService()
  })

  test('getCommitId - returns error message when cannot be obtained', async () => {
    const actual = await sut.getCommitId()
    expect(actual).toBe('NOT FOUND')
  })

  test('getBuildNumber - returns error message when cannot be obtained', async () => {
    const actual = await sut.getBuildNumber()
    expect(actual).toBe('NOT FOUND')
  })
})
