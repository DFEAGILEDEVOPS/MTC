import { CheckSubmitService } from './check-submit.service'

describe('check submit service', () => {
  test('dispatches the payload onto the relevant service bus queue', async () => {
    const sut = new CheckSubmitService()
    await sut.submit({})
    expect(true).toBe('not implemented')
  })
})
